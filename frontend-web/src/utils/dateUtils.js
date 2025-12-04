import moment from 'moment';

export const formatDate = (date) => {
    if (!date) return '';
    return moment(date).format('MMMM D, YYYY');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return moment(date).format('MMMM D, YYYY h:mm A');
};

export const formatTime = (date) => {
    if (!date) return '';
    return moment(date).format('h:mm A');
};
