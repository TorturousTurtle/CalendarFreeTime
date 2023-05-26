import express from 'express';
import cors from 'cors';
import { get_free_times } from './calendarTime.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

function convert_date_format(date_string) {
  const year = date_string.slice(0, 4);
  const month = date_string.slice(5, 7);
  const day = date_string.slice(8);
  const date = `${month}/${day}/${year}`;
  return date;
}

app.post('/api/submit', async (req, res) => {
  const data = req.body;
  const emailAddresses = data.emailAddresses;
  const startDate = convert_date_format(data.startDate);
  const endDate = convert_date_format(data.endDate);
  const optionValue = data.optionValue;

  const result = await get_free_times(emailAddresses, startDate, endDate, optionValue);
  const response = {
    status: 200,
    message: 'Form submitted successfully',
    data: {
      result: result,
    },
  };
  res.json(response);
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
