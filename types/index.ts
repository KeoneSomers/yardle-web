declare global {
  //   type SomeType = [boolean, string, number];
  interface Alert {
    title: string;
    message: string;
    type: string;
  }
}

export { Alert };
