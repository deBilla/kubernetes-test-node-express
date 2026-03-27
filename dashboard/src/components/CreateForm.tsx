import React, { useState } from "react";

interface Field {
  name: string;
  label: string;
  type: "text" | "number";
}

interface Props {
  fields: Field[];
  onSubmit: (data: Record<string, string | number>) => void;
}

export const CreateForm: React.FC<Props> = ({ fields, onSubmit }) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string | number> = {};
    fields.forEach((f) => {
      data[f.name] = f.type === "number" ? Number(values[f.name] || 0) : values[f.name] || "";
    });
    onSubmit(data);
    setValues({});
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      {fields.map((f) => (
        <input
          key={f.name}
          type={f.type}
          placeholder={f.label}
          value={values[f.name] || ""}
          onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
          required
        />
      ))}
      <button type="submit">Create</button>
    </form>
  );
};
