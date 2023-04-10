export function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  } else if (error && typeof error === "object" && "message" in error) {
    return getErrorMessage(error.message);
  } else if (error && typeof error === "object" && "error" in error) {
    return getErrorMessage(error.error);
  } else if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray(error.errors)
  ) {
    return error.errors.map(getErrorMessage).join("; ");
  } else if (error && typeof error === "object" && "data" in error) {
    return getErrorMessage(error.data);
  } else {
    return "Some error occurred";
  }
}
