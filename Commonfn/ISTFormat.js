import moment from 'moment-timezone'
export const addCreatedAtIST = async (schema) => {
    schema.virtual('createdAtIST').get(function() {
      return moment(this.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A');
    });
    schema.set('toJSON', { virtuals: true });
};