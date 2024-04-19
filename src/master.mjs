export async function sync(master, api, options) {
  const context = master.context;
  const response = await fetch(`${api}/category`, options);

  for (const json of await response.json()) {
    const category = await master.addCategory(context, json);
    console.log(json);
    await category.write(context);
  }
}
