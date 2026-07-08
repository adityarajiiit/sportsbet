"use client"
import {useEffect,useState} from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export const Tabs=({
  tabs:propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
})=>{
  const [activeValue,setActiveValue]=useState(propTabs[0]?.value)
  const [tabOrder,setTabOrder]=useState(()=>
    propTabs.map((tab)=>tab.value)
  )
  useEffect(()=>{
    const availableValues=propTabs.map((tab)=>tab.value)
    setTabOrder((prevOrder)=>{
      const kept=prevOrder.filter((value)=>availableValues.includes(value))
      const added=availableValues.filter((value)=>!kept.includes(value))
      return [...kept, ...added]
    })
    setActiveValue((prevValue)=>{
      if(availableValues.includes(prevValue)){
        return prevValue
      }
      return availableValues[0]
    })
  },[propTabs])
  const moveSelectedTabToTop=(idx)=>{
    const selectedValue = propTabs[idx]?.value
    if (!selectedValue) return
    setTabOrder((prevOrder) => [
      selectedValue,
      ...prevOrder.filter((value) => value !== selectedValue),
    ])
    setActiveValue(selectedValue)
  }

  const tabs = tabOrder
    .map((value) => propTabs.find((tab) => tab.value === value))
    .filter(Boolean)

  const [hovering, setHovering] = useState(false)

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx)
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn("relative px-4 py-2 rounded-full", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {activeValue === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "input border-none absolute inset-0 dark:bg-gray-200 bg-muted-foreground rounded-full ",
                  activeTabClassName
                )}
              />
            )}

            <span className="relative block dark:text-black text-white font-inter">
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      <FadeInDiv
        tabs={tabs}
        activeValue={activeValue}
        key={activeValue}
        hovering={hovering}
        className={cn("mt-24", contentClassName)}
      />
    </>
  )
}

export const FadeInDiv = ({ className, tabs, hovering, activeValue }) => {
  const isActive = (tab) => {
    return tab.value === activeValue
  }
  return (
    <div className="relative w-full h-full">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -50 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn("w-full h-full absolute top-0 left-0", className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  )
}
