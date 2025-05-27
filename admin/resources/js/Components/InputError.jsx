export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-errorRed' + className}
        >
            {message}
        </p>
    ) : null;
}
