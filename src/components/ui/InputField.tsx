interface InputFieldProps {
    label?: string;
    placeholder: string;
    value: string;
    type?: string;
    large: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function InputField({
    label,
    placeholder,
    value,
    type="text",
    large=false,
    onChange
}: InputFieldProps) {
    const inputId = label ? label.toLowerCase().replace("/\s+g", "-") : "input-field";
    
    return(
        <div className="flex flex-col gap-1.5">
            <label className="text-zinc-300 font-medium text-sm">{label}</label>

            {large ? (
                <textarea
                    id={inputId}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="py-2 px-3 border border-zinc-300 placeholder:text-zinc-700 text-zinc-200 shadow-xs rounded-lg focus:ring-[4px] focus:ring-zinc-400/15 focus:outline-none h-24 align-text-top"
                    rows = {4}
                />
            ) : (
                <input
                    id={inputId}
                    type={type}
                    placeholder={placeholder}
                    value = {value}
                    onChange={onChange}
                    className="py-2 px-3 border border-zinc-300 placeholder:text-zinc-700 text-zinc-200 shadow-xs rounded-lg focus:ring-[4px] focus:ring-zinc-400/15 focus:outline-none"
                />
            )
            }
        </div>
    );
}