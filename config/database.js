import mongoose from "mongoose";

const connect = () => {
    const url =process.env.DB_URI
    mongoose.connect(url).then(() => {
        console.log(`Database connected`)
    }).catch(() => {
        console.log(`Error while connected to database`)
    })
}

const database = {
    connect
}
export default database;