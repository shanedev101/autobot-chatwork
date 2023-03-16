import { Router } from 'express';
import axios from 'axios';
const dotenv = require('dotenv');
dotenv.config();

const routes = Router();

// Set up the API endpoint and access token
const baseUrl = 'https://api.chatwork.com/v2';
const accessToken = process.env.CHATWORK_TOKEN || '';

routes.get('/', async (req, res) => {
  try {
    if (!accessToken) {
      return res.status(500).json({ msg: 'Missing chatwork token' });
    }

    // Set up the Axios instance with the API endpoint and access token in the headers
    const chatworkApi = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-ChatWorkToken': accessToken,
      },
    });

    // Make a call to the Chatwork API to get the list of rooms
    await chatworkApi
      .get('/rooms')
      .then((response) => {
        return res.status(200).json({
          msg: 'OK',
          data: response.data,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          msg: 'ERROR',
          data: null,
          error: error,
        });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Sorry, something went wrong :/' });
  }
});

routes.post('/', async (req, res) => {
  try {
    if (!accessToken) {
      return res.status(500).json({ msg: 'Missing chatwork token' });
    }

    console.log(req.body);

    let roomId = '',
      message = '',
      fromAccountId = '';
    if (req.body) {
      roomId = req.body.room_id;
      message = req.body.webhook_event.body;
      fromAccountId = req.body.webhook_event.from_account_id;
      if (roomId && message && fromAccountId) {
        // Set up the Axios instance with the API endpoint and access token in the headers
        const chatworkApi = axios.create({
          baseURL: baseUrl,
          headers: {
            'X-ChatWorkToken': accessToken,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'ChatWork-Webhook/1.0.0',
            'x-chatworkwebhooksignature': process.env.SIGNATURE,
          },
        });
        // Make a call to the Chatwork API to send the message
        await chatworkApi
          .post(`/rooms/${roomId}/messages`, {
            body: `[To:${fromAccountId}]` + message,
          })
          .then((response) => {
            return res.status(200).json({
              msg: 'OK',
              data: response.data,
            });
          })
          .catch((error) => {
            return res.status(500).json({
              msg: 'ERROR',
              data: null,
              error: error,
            });
          });
      }
    } else {
      return res.status(400).json({ msg: 'Missing data. Skip send.' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Sorry, something went wrong :/\n${error}` });
  }
});

export default routes;
