import * as cron from 'node-cron';
import { getData } from './dataPull';

cron.schedule('*/10 * * * * *', () => {
    getData();
})