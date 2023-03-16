// import "./lib/db";
import botChatworkRoutes from './routes/botChatwork';
import express from 'express';
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3333;
const app_url = process.env.APP_URL || 'http://localhost';

app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

app.get('/', async (req, res) => {
  res.json({ message: 'Hello world!' });
});

app.use('/bot-chatwork', botChatworkRoutes);

app.listen(port, () => {
  console.log(`Example app listening at ${app_url}:${port}`);
});
