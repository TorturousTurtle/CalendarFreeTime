import { google } from 'googleapis';
import { credentials } from './stellar-market-385817-512cc8dfa90b.js';

const SERVICE_ACCOUNT_FILE = 'stellar-market-385817-512cc8dfa90b.json';
const TIMEZONE = 'US/Eastern';

function convert_date_format(date_string) {
  const [year, month, day] = date_string.split('-');
  const date = `${month}/${day}/${year}`;
  return date;
}

export async function get_free_times(CALENDAR_IDS, start_date, end_date, slot_length) {
  try {
    const creds = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/calendar']
    );

    const service = google.calendar({ version: 'v3', auth: creds });

    const start_datetime = new Date(start_date);
    const end_datetime = new Date(end_date);

    const time_min = new Date(start_datetime.getFullYear(), start_datetime.getMonth(), start_datetime.getDate(), 9);
    const time_max = new Date(end_datetime.getFullYear(), end_datetime.getMonth(), end_datetime.getDate(), 17);
    time_max.setDate(time_max.getDate());

    let delta;
    if (slot_length === '30') {
      delta = 30 * 60 * 1000; // 30 minutes in milliseconds
    } else if (slot_length === '60') {
      delta = 60 * 60 * 1000; // 60 minutes in milliseconds
    } else {
      throw new Error('Slot length must be 30 or 60');
    }

    const free_times_by_date = {};
    let current_datetime = new Date(time_min);
    while (current_datetime <= time_max) {
      let free = true;
      for (const calendar_id of CALENDAR_IDS) {
        const events_result = await service.events.list({
          calendarId: calendar_id,
          timeMin: current_datetime.toISOString(),
          timeMax: new Date(current_datetime.getTime() + delta).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });

        if (events_result.data.items && events_result.data.items.length > 0) {
          free = false;
          break;
        }
      }

      if (free && current_datetime.getHours() >= 9 && current_datetime.getHours() < 17) {
        const date = `${current_datetime.getMonth() + 1}/${current_datetime.getDate()}/${current_datetime.getFullYear().toString().slice(-2)}`;
        if (!free_times_by_date[date]) {
          free_times_by_date[date] = [];
        }
        free_times_by_date[date].push(current_datetime);
      }

      current_datetime = new Date(current_datetime.getTime() + delta);
      if (current_datetime.getHours() >= 17) {
        current_datetime = new Date(current_datetime.getFullYear(), current_datetime.getMonth(), current_datetime.getDate() + 1, 9);
      }
    }


    const results = [];
    for (const [date, free_times] of Object.entries(free_times_by_date)) {
      const free_times_formatted = free_times.map((free_time) =>
        free_time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()
      );
      results.push(`${date} - ${free_times_formatted.join(', ')}`);
    }

    return results;
  } catch (error) {
    console.error('An error occurred while fetching free times:', error);
    throw new Error('Failed to fetch free times. Please try again later.');
  }
}
