import { useCallback, type FormEvent } from "react";

export function StorySubmissionForm() {
  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch(`/submit.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(() => {
        document.location.reload();
      })
      .catch((error) => {
        console.error("Something went wrong while submitting story,", error);
      });
  }, []);

  return (
    <form
      autoComplete="off"
      className="flex flex-col gap-y-2"
      onSubmit={handleSubmit}
    >
      <input
        autoComplete="false"
        name="hidden"
        type="text"
        className="hidden"
      />
      <div className="flex items-center gap-x-2">
        <label htmlFor="title" className="w-10">
          title
        </label>
        <input
          id="title"
          className="border border-slate-500 rounded flex-1"
          type="text"
          name="title"
          required
        />
      </div>
      <div className="flex items-center gap-x-2">
        <label htmlFor="url" className="w-10">
          url
        </label>
        <input
          id="url"
          className="border border-slate-500 rounded flex-1"
          type="url"
          name="url"
          required
        />
      </div>
      <div className="flex items-center gap-x-2">
        <label htmlFor="text" className="w-10">
          text
        </label>
        <textarea
          id="text"
          className="border border-slate-500 rounded flex-1"
          name="text"
        ></textarea>
      </div>

      <button className="w-fit px-2 bg-slate-200 border border-slate-700 rounded ml-12">
        submit
      </button>
    </form>
  );
}
