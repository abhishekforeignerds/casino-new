import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'red': '#A43434',
                'red-100': 'rgb(164 52 52 / 10%)',
                'red-200': 'rgb(164 52 52 / 20%)',
                'red-300': 'rgb(164 52 52 / 30%)',
                'red-400': 'rgb(164 52 52 / 40%)',
                'red-500': 'rgb(164 52 52 / 50%)',
                'red-600': 'rgb(164 52 52 / 60%)',
                'red-700': 'rgb(164 52 52 / 70%)',
                'red-800': 'rgb(164 52 52 / 80%)',
                'red-900': 'rgb(164 52 52 / 90%)',
                'green': '#64C919',
                'green-100': 'rgb(100 201 25 / 10%)',
                'green-200': 'rgb(100 201 25 / 20%)',
                'green-300': 'rgb(100 201 25 / 30%)',
                'green-400': 'rgb(100 201 25 / 40%)',
                'green-500': 'rgb(100 201 25 / 50%)',
                'green-600': 'rgb(100 201 25 / 60%)',
                'green-700': 'rgb(100 201 25 / 70%)',
                'green-800': 'rgb(100 201 25 / 80%)',
                'green-900': 'rgb(100 201 25 / 90%)',
                'blue': '#588DFF',
                'blue-100': 'rgb(88 141 255 / 10%)',
                'blue-200': 'rgb(88 141 255 / 20%)',
                'blue-300': 'rgb(88 141 255 / 30%)',
                'blue-400': 'rgb(88 141 255 / 40%)',
                // 'blue-500': 'rgb(88 141 255 / 50%)',
                'blue-600': 'rgb(88 141 255 / 60%)',
                'blue-700': 'rgb(88 141 255 / 70%)',
                'blue-800': 'rgb(88 141 255 / 80%)',
                'blue-900': 'rgb(88 141 255 / 90%)',
                'lightGreen': '#EBFEDD',
                'lightPurple': '#D9D2FF',
                'lightPink': '#FFEFEF',
                'lightBlue': '#D2E0FF',
                'lightBlueSky': '#D2F2FF',
                'lightYellow': '#FCFFD2',
                'lightShadeGreen': '#D2FFDC',
                'skyBlue': '#17B3CB',
                'red-hover': '#bc4040',
                'LightPink-800': '#FFCCDB',
                'statusYellow': '#B8C736',
                'statusRed': '#FAEBEB',
                'lightGrayTheme': '#F4F7FB',
                'errorRed': '#ff0000',
                'darkBlue': '#1930C9',
                'darkBlueOpacity': '#DDECFE',
                'darkRedOpacity': '#FEDEDD',
                'darkShadeGreen': 'hsl(120deg 100% 25% / 80%)',
                'darkRed': '#C91919',
            },
        },
    },

    plugins: [
        forms,
        plugin(function ({ addUtilities }) {
            addUtilities({
                '[type="text"]:focus, input:where(:not([type])):focus, [type="email"]:focus, [type="url"]:focus, [type="password"]:focus, [type="file"]:focus, [type="number"]:focus, [type="date"]:focus, [type="datetime-local"]:focus, [type="month"]:focus, [type="search"]:focus, [type="tel"]:focus, [type="time"]:focus, [type="week"]:focus, [multiple]:focus, textarea:focus, select:focus': {
                    outline: '1px solid transparent',
                    outlineOffset: '2px',
                    '--tw-ring-inset': 'var(--tw-empty, /*!*/ /*!*/)',
                    '--tw-ring-offset-width': '0px',
                    '--tw-ring-offset-color': '#fff',
                    '--tw-ring-color': 'var(--primary)',
                    '--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
                    boxShadow: 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)',
                    borderColor: 'var(--primary)',
                },
            });
        }),
    ],
};
