export async function sync(master, api, options) {
  const context = master.context;
  const response = await fetch(`${api}/category`, options);

  for (const json of await response.json()) {
    const category = await master.addCategory(context, json);
    await category.write(context);

    const response = await fetch(
      `${api}/category/${category.name}/meter`,
      options
    );
    for (const json of await response.json()) {
      const meter = await category.addMeter(context, json);
      await meter.write(context);

      let response = await fetch(
        `${api}/category/${category.name}/meter/${meter.name}/value`,
        options
      );
      for (const json of await response.json()) {
        const value = await meter.addValue(context, json);
        await value.write(context);
      }

      response = await fetch(
        `${api}/category/${category.name}/meter/${meter.name}/note`,
        options
      );
      for (const json of await response.json()) {
        const note = await meter.addNote(context, json);
        await note.write(context);
      }
    }
  }
}
