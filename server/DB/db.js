import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";


// Bu şekilde yeni  bir pool objesi oluşturulmalı
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

export default pool;
