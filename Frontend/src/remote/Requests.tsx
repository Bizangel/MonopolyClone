import { ZodSchema } from "zod";
import { HTTPSHOST } from "common/common";
import { isDevelopment } from "common/common";


type RequestMethods = "GET" | "POST";

export async function requestSchema<outT, replyT>(url: string, json_body: outT,
  method: RequestMethods, expected_response: ZodSchema<replyT>,
  includeCredentials: boolean) {
  var response: any = null;
  try {
    response = await fetch(HTTPSHOST() + url, {
      method: method,
      mode: isDevelopment ? "cors" : "same-origin",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json_body),
      credentials: includeCredentials ? "include" : undefined
    })
  } catch (Exception) {
    response = null;
  }


  if (response == null)
    return null;

  var jsonresponse = await response.json();
  var ticket = expected_response.safeParse(jsonresponse)
  if (ticket.success) {
    return ticket.data as replyT
  }

  console.warn("Unable to parse response from server!, response: ", response)

  return null;
}

