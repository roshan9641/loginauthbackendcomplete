import mongoose from 'mongoose';

const connect = async()=>{
    try {
await mongoose.connect(process.env.MONGODB_URL);
console.log("database connected");
    } catch (error) {
       console.error(error);
        process.exit(1);
    }


}
export default connect;