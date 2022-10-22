import { ZodSchema } from "zod";
import { HTTPSHOST } from "common/common";
import { isDevelopment } from "common/common";

export namespace MonopolyRequests {

  export enum RequestMethods {
    GET = "GET",
    POST = "POST",
  }

  export async function requestSchema<T>(url: string, json_body: Object,
    method: RequestMethods, expected_response: ZodSchema<T>,
    includeCredentials: boolean) {
    var response: any = null;
    try {
      response = await fetch(HTTPSHOST() + url, {
        method: method,
        mode: isDevelopment ? "no-cors" : "cors",
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
      return ticket.data as T
    }

    return null;
  }

}