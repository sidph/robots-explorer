/**
 * Thin wrapper around the diagnostics API. Keeping this in one place means
 * if the backend contract changes, there's exactly one file to update -
 * components never build fetch calls themselves.
 */

/**
 * @param {string} url - website URL as typed by the user
 * @returns {Promise<object>} parsed diagnostic result
 * @throws {Error} with a human-readable message on failure
 */
export async function runRobotsDiagnostic(url) {
  const params = new URLSearchParams({ url });
  let response;

  try {
    response = await fetch(`/api/diagnostics/robots?${params.toString()}`);
  } catch {
    throw new Error("Couldn't reach the Robots Explorer API. Check your connection and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server sent back something unexpected. Try again in a moment.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong while checking that site.");
  }

  return data;
}
