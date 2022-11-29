export default defineEventHandler(async (event) => {
    // EXAMPLE: handle get request query params
    // const { name } = useQuery(event);

    // EXAMPLE: handle post request data
    // const { name } = await useBody(event);

    const { mySuperSecretAPIKey } = useRuntimeConfig();

    return {
        message: "Hello there!",
    };
});
