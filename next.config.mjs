/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains:['cdn.sportmonks.com','lh3.googleusercontent.com']
    },
    async rewrites(){
        return [
            {
                source:'/api-backend/:path*',
                destination:`${process.env.BACKEND_URL||'https://sportsbet-betting.onrender.com'}/:path*`
            }
        ]
    }
};

export default nextConfig;
