'use client'
import { Sparkles } from "lucide-react"
import {motion,AnimatePresence} from 'motion/react'
import { FaUser } from "react-icons/fa"
import { IoSend, IoStop } from "react-icons/io5"
import { MdKeyboardArrowDown } from "react-icons/md"
import { RiRobot2Fill } from "react-icons/ri"
import { TbSparkles } from "react-icons/tb"
import {useState,useRef,useEffect,useCallback} from 'react'
import {v4 as uuidv4} from 'uuid'
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown'
import {useAiContext} from '@/app/store/useAiContext'
const apiurl=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000'
export default function Chat(){
  const[isOpen,setIsOpen]=useState(false)
  const[input,setInput]=useState('')
  const[messages,setMessages]=useState([])
  const[isStreaming,setIsStreaming]=useState(false)
  const[isAnalyzing,setIsAnalyzing]=useState(false)
  const[sessionId]=useState(()=>uuidv4())
  const abortRef=useRef(null)
  const messagesEndRef=useRef(null)
  const{pageType,matchId,matchData,oddsData,liveScore,stockId,stockData,priceHistory}=useAiContext()
  const recommendations=[
    "Best bet today?",
    'Analyze a match',
    'Stock picks',
    'Cricket trivia'
  ]
  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:'smooth'})
  },[messages])
  useEffect(()=>{
    if(isOpen){
      setTimeout(()=>{
        inputRef.current?.focus()
      },300)
    }
  },[isOpen])
  const buildPageContext=useCallback(()=>{
    const base={page:window.location.pathname,pageType}
    if(pageType==='match'&&matchId){
      return{
        ...base,
        matchId,
        matchData,
        oddsData,
        liveScore,
      }
    }
    if(pageType==='stock'&&stockId){
      return{
        ...base,
        stockId,
        stockData,
        priceHistory,
      }
    }
    return base
  },[pageType,matchId,matchData,oddsData,liveScore,stockId,stockData,priceHistory])
  const sendMessage=useCallback(async(q)=>{
      const query=(q||input).trim()
      if(!query||isStreaming){
        return
      }
      setMessages(prev=>[
        ...prev,
        {
          role:'user',
          content:query
        },
        {
          role:'ai',
          content:''
        }
      ])
      setInput('')
      setIsStreaming(true)
      setIsAnalyzing(false)
      const controller=new AbortController()
      abortRef.current=controller
      try{
         const res=await fetch(`${apiurl}/api/ai/chat`,{
          method:'POST',
          credentials:'include',
          signal:controller.signal,
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            query,
            sessionId,
            context:buildPageContext()
          })
         })
         const reader=res.body.getReader()
         const decoder=new TextDecoder()
         let buffer=''
         while(true){
          const{value,done}=await reader.read()
          if(done){
            break
          }
          buffer+=decoder.decode(value,{stream:true})
          const lines=buffer.split('\n')
          buffer=lines.pop()||''
          for(const line of lines){
            if(!line.startsWith('data:')){
              continue
            }
            const raw=line.slice(5).trim()
            if(!raw){
              continue
            }
            try{
                const data=JSON.parse(raw)
                if(data.type==='analyzing'){
                  setIsAnalyzing(true)
                }
                if(data.type==='token'&&data.content){
                  setIsAnalyzing(false)
                  setMessages(prev=>{
                    const next=[...prev]
                    const lastIndex=next.length-1
                    if(next[lastIndex]?.role==='ai'){
                      next[lastIndex]={
                        ...next[lastIndex],
                        content:next[lastIndex].content+data.content
                      }
                    }
                    return next
                  })
                }
            }
            catch(e){
              toast.error("Error in parsing")
            }
          }
         }
      }
      catch(e){
        toast.error("Error in fetching")
        if(e.name==='AbortError'){
          setMessages(prev=>{
            const next=[...prev]
            if(next.length&&next[next.length-1].role==='ai'){
              next[next.length-1]={
                ...next[next.length-1],
                content:'Error in fetching response'
              }
            }
            return next
          })
        }
      }
      finally{
        setIsStreaming(false)
        setIsAnalyzing(false)
        abortRef.current=null
      }
  },[input,isStreaming,sessionId,buildPageContext])
  const stopStream=()=>{
    abortRef.current?.abort()
    setIsStreaming(false)
    setIsAnalyzing(false)
  }
  const inputRef=useRef(null)
  const handleSubmit=(e)=>{
    e.preventDefault()
    const query=input.trim()
    if(!query){
      return
    }
    sendMessage(query)
  }
  const StreamingCursor=()=>{
    return(
      <motion.span
      animate={{opacity:[1,0,1]}}
      transition={{
        duration:1.5,
        repeat:Infinity,
        ease:'linear'
      }}
      className="inline-block w-1 h-3 bg-warning ml-1 align-middle rounded-full"
      />
    )
  }

  const MessageBubble=({msg,isLastAI,isStreaming})=>{
    const isUser=msg.role==='user'
    return(
      <motion.div
      intital={{
        opacity:0,
        y:10,
        scale:0.95
      }}
      animate={{
        opacity:1,
        y:0,
        scale:1
      }}
      transition={{
        duration:0.2,
        ease:'easeOut'
      }}
      className={`flex items-end gap-2 ${isUser?'justify-end':'justify-start'}`}
      >
        {!isUser&&(
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1 bg-warning/10 border border-warning/20">
            <RiRobot2Fill className="text-warning size-4"/>
          </div>
        )}
        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm font-inter leading-relaxed break-words ${
          isUser?'bg-warning text-base-100 font-medium rounded-br-sm':'bg-base-300 border border-base-content/5 rounded-bl-sm'
        }`}
        >
          {msg.content?(
            <span>
              {msg.role==='ai'?(
                <ReactMarkdown
                  components={{
                    p:({children})=><p className="mb-1 last:mb-0">{children}</p>,
                    strong:({children})=><strong className="font-semibold text-warning">{children}</strong>,
                    em:({children})=><em className="italic opacity-80">{children}</em>,
                    ul:({children})=><ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
                    ol:({children})=><ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
                    li:({children})=><li className="leading-snug">{children}</li>,
                    h1:({children})=><p className="font-bold text-base mb-1">{children}</p>,
                    h2:({children})=><p className="font-bold text-sm mb-1">{children}</p>,
                    h3:({children})=><p className="font-semibold text-sm mb-0.5">{children}</p>,
                    code:({children})=><code className="bg-base-100/40 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    hr:()=><hr className="border-base-content/10 my-1.5"/>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ):msg.content}
              {isLastAI&&isStreaming&&!isAnalyzing&&<StreamingCursor/>}
            </span>
          ):isLastAI&&isStreaming?(
            <span className="flex items-center gap-2 text-xs text-base-content/50 font-poppins">
              <span className="loading loading-dots loading-xs">
                {isAnalyzing?'Analyzing...':'Thinking...'}
              </span>
            </span>
          ):null}
        </div>
        {isUser&&(
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1 bg-base-300 border border-base-content/10">
            <FaUser className="size-3 text-base-content/40"/>
          </div>
        )}
      </motion.div>
    )
  }
  return(
    <>
    <AnimatePresence>
      {!isOpen&&(
        <motion.button
        onClick={()=>setIsOpen(true)}
        initial={{
          opacity:0,
          scale:0.8,
          y:16
        }}
        animate={{
          opacity:1,
          scale:1,
          y:0
        }}
        exit={{
          opacity:0,
          scale:0.8,
          y:16
        }}
        whileHover={{
          scale:1.1
        }}
        whileTap={{
          scale:0.90
        }}
        transition={{
          type:'spring'
        }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full font-poppins font-semibold text-sm text-base-100 bg-warning cursor-pointer"
        >
        <motion.span
        animate={{
          scale:[1,1.5,1],
          opacity:[0.5,0,0.5]
        }}
        transition={{
          duration:2.5,
          repeat:Infinity,
          ease:'easeInOut'
        }}
        className="absolute inset-0 rounded-full bg-warning"
        />
        <Sparkles className="size-4.5 shrink-0 relative z-10"/>
        <span className="relative z-10">Ask AI</span>
        </motion.button>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {isOpen&&(
        <motion.div
        initial={{
          opacity:0,
          y:20,
          scale:0.90
        }}
        animate={{
          opacity:1,
          y:0,
          scale:1
        }}
        exit={{
          opacity:0,
          y:20,
          scale:0.90
        }}
        transition={{
          type:'spring'
        }}
        className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[560px] rounded-2xl overflow-hidden bg-base-200 border border-base-content/10"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10 bg-base-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center
              justify-center bg-warning/10 border border-warning/20">
                <RiRobot2Fill className="text-warning size-5"/>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-200"/>
            </div>
            <div>
              <h3 className="font-poppins font-bold text-sm leading-tight">
                SportsBet <span className="text-warning">AI</span>
              </h3>
              <p className="text-[10px] text-base-content/40 font-inter leading-tight mt-0.5">
                {pageType==='match'?'Viewing Match · Cricket Expert':pageType==='stock'?'Viewing Stock · Trading Expert':'Cricket Expert'}
              </p>
            </div>
          </div>
          <button
          onClick={()=>setIsOpen(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-base-content/10 transition-colors"
          >
          <MdKeyboardArrowDown className="size-5 text-base-content/40"/>
          </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 no-visible-scrollbar">
            {messages.length===0?(
              <motion.div
                initial={{opacity:0}}
                animate={{opacity:1}}
                transition={{delay:0.2}}
                className="flex flex-col items-center justify-center h-full gap-4 px-4"
              >
                <motion.div
                  animate={{rotate:[0,6,-6,0]}}
                  transition={{
                    duration:3,
                    repeat:Infinity,
                    ease:'easeInOut'
                  }}
                >
                  <TbSparkles className="size-10 text-warning"/>
                </motion.div>
                <div className="text-center">
                  <p className="font-poppins font-semibold text-sm">
                    Ask me anything
                  </p>
                  <p className="text-xs text-base-content/50 font-inter mt-1">
                  Bets · Match analysis · Predictions · Odds · Tips
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {recommendations.map(p=>(
                    <motion.button
                      key={p}
                      whileHover={{scale:1.05}}
                      whileTap={{scale:0.95}}
                      onClick={()=>sendMessage(p)}
                      className="px-3 py-1.5 rounded-full text-xs font-inter
                      font-medium border border-warning/20 text-warning/50 hover:border-warning/50 hover:text-warning hover:bg-warning/5 transition-all duration-150
                      "
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ):(
              <>
                {messages.map((msg,index)=>(
                  <MessageBubble
                    key={index}
                    msg={msg}
                    isLastAI={index===messages.length-1&&msg.role==='ai'}
                    isStreaming={isStreaming}
                  />
                ))}
                <div ref={messagesEndRef}/>
              </>
            )}
          </div>
          <div className="px-3 py-3 border-t border-base-bg-base-300 shrink-0">
            <form className="flex items-center gap-2" onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                ref={inputRef}
                placeholder="Ask about cricket bets stocks etc..."
                className="flex-1 px-4 py-2 rounded-full text-sm font-inter bg-base-300 border border-base-content/10
                focus:outline-none focus:border-warning/40 placeholder:text-base-content/30 transition-colors duration-150
                "
              />
              {isStreaming?(
                <motion.button
                type="button"
                onClick={stopStream}
                whileTap={{scale:0.9}}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-colors"
                >
                  <IoStop className="size-4"/>
                  </motion.button>
              ):(
              <motion.button
              type="submit"
              disabled={!input.trim()}
              whileTap={{scale:0.9}}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-warning border
              disabled:bg-warning/20 border border-warning/40
              disabled:opacity-40 transition-all duration-150
              "
              >
                <IoSend className="size-4 ${input.trim()?'text-base-100':'text-warning/50'}"/>
              </motion.button>
              )}
            </form>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
