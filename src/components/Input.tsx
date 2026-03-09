import type {
	FieldValues,
	Path,
	RegisterOptions,
	UseFormRegister,
} from "react-hook-form";

export default function Input<T extends FieldValues>({
	label,
	type,
	name,
	placeholder,
	register,
	options,
}: {
	label: string;
	type: string;
	name: string;
	placeholder?: string;
	register: UseFormRegister<T>;
	options?: RegisterOptions<T>;
}) {
	return (
		<div>
			<label
				htmlFor={name}
				className="block text-base/7 font-semibold text-neutral-950"
			>
				{label}
			</label>
			<div className="mt-2">
				<input
					id={name}
					type={type}
					required={
						typeof options?.required === "boolean" ? options.required : false
					}
					placeholder={placeholder}
					{...register(name as Path<T>, options)}
					className="block h-10 w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-900 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
				/>
			</div>
		</div>
	);
}
