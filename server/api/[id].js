export default defineEventHandler(async (event) => {
    // get route param
    const { id } = event.context.params;

    return {
        message: `Hello there, your id is: ${id}`,
    };
});
