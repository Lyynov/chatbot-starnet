const moment = require('moment');

class Validation {
    static validateDate(dateString) {
        // Check format DD/MM/YYYY
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        
        if (!dateRegex.test(dateString)) {
            return false;
        }

        const [, day, month, year] = dateString.match(dateRegex);
        
        // Create moment object
        const date = moment(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, 'YYYY-MM-DD');
        
        // Check if date is valid
        if (!date.isValid()) {
            return false;
        }

        // Check if date is not in the past (allow today)
        const today = moment().startOf('day');
        if (date.isBefore(today)) {
            return false;
        }

        // Check if date is not too far in the future (max 1 year)
        const maxDate = moment().add(1, 'year');
        if (date.isAfter(maxDate)) {
            return false;
        }

        return true;
    }

    static validatePhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Check Indonesian phone number format
        // Should start with 08, 628, or +628
        const indonesianRegex = /^(08\d{8,11}|628\d{8,11}|\+628\d{8,11})$/;
        
        return indonesianRegex.test(cleanNumber);
    }

    static validateName(name) {
        // Name should be at least 2 characters and contain only letters and spaces
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name.trim());
    }

    static validateRouterType(routerType) {
        // Router type should be at least 2 characters
        return routerType && routerType.trim().length >= 2 && routerType.trim().length <= 50;
    }

    static validateSerialNumber(serialNumber) {
        // Serial number should be alphanumeric, at least 3 characters
        const snRegex = /^[a-zA-Z0-9]{3,30}$/;
        return snRegex.test(serialNumber.replace(/\s/g, ''));
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove potential malicious characters
        return input
            .trim()
            .replace(/[<>\"']/g, '') // Remove HTML/script injection chars
            .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
            .substring(0, 500); // Limit length
    }

    static isValidMenuOption(option) {
        const validOptions = ['1', '2', '3', 'pemasangan', 'reimbursh', 'exit', 'menu', 'start'];
        return validOptions.includes(option.toLowerCase());
    }

    static formatDateForDisplay(dateString) {
        // Convert DD/MM/YYYY to readable format
        const [day, month, year] = dateString.split('/');
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
    }
}

module.exports = {
    validateDate: Validation.validateDate,
    validatePhoneNumber: Validation.validatePhoneNumber,
    validateName: Validation.validateName,
    validateRouterType: Validation.validateRouterType,
    validateSerialNumber: Validation.validateSerialNumber,
    sanitizeInput: Validation.sanitizeInput,
    isValidMenuOption: Validation.isValidMenuOption,
    formatDateForDisplay: Validation.formatDateForDisplay
};