import mongoose from "mongoose";

const uri=process.env.MONGODB_URI?.trim();
const databaseName=process.env.MONGODB_DB_NAME?.trim()||"edupilo";

const fail=(message)=>{
  console.error(`[database] MongoDB connection failed: ${message}`);
  process.exitCode=1;
};

if(!uri){
  fail("MONGODB_URI is not configured");
}else if(!uri.startsWith("mongodb+srv://")&&!uri.startsWith("mongodb://")){
  fail("MONGODB_URI is invalid");
}else{
  try{
    await mongoose.connect(uri,{
      dbName:databaseName,
      serverSelectionTimeoutMS:8000,
      connectTimeoutMS:8000,
      maxPoolSize:1,
      minPoolSize:0,
      bufferCommands:false,
    });
    await mongoose.connection.db.admin().ping();
    console.log(`[database] MongoDB connected successfully (${databaseName})`);
  }catch{
    fail("check the URI, Atlas Network Access, database user, and cluster status");
  }finally{
    await mongoose.disconnect();
  }
}
