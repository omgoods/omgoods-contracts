export function runScript(main: () => Promise<void>): void {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then(() => {
      process.exit();
    });
}
