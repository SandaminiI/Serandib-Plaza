import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
<<<<<<< Updated upstream
import categoryRoutes from './routes/categoryRoute.js'
=======
import AuthRoutes from './routes/AuthRoute.js'
import promotionRoutes from "./routes/promotionRoute.js"
import categoryRoutes from './routes/categoryRoute.js'
import productRoutes from  './routes/productRoute.js'

>>>>>>> Stashed changes

//configure env
dotenv.config();

//database config
connectDB();

//rest object
const app = express();

//middelwares
app.use(express.json())
app.use(morgan('dev'))

//routes
<<<<<<< Updated upstream
app.use('/api/v1/category', categoryRoutes);
=======
app.use("/api/v1/userauth",AuthRoutes)
app.use("/api/v1/promotions",promotionRoutes)
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);
>>>>>>> Stashed changes

// rest api
app.get("/" , (req,res) => {
    res.send({
        message: "Welcome to  Serandib Plaza",
    });
});

//Port
const PORT = process.env.PORT || 8088;

//run listen
app.listen(PORT, () => {
    console.log(`Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white);
});
