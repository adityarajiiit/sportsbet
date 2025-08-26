module.exports={
    apps:[
        {
            name:'nextjs-app',
            script:'npm',
            args:'start',
            env:{
                NODE_ENV:'production'
            }
        },
        {
            name:'betting-engine',
            script:'./Betting Engine/dist/index.js',
            env:{
                NODE_ENV:'production',
                ARCJET_ENV: 'production'
                
            }
        }
    ]
}