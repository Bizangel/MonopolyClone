import { ZodSchema } from "zod";
import { HTTPSHOST } from "../common/common";


export namespace MonopolyRequests {

  export enum RequestMethods {
    GET = "GET",
    POST = "POST",
  }

  export async function requestSchema<T>(url: string, json_body: Object, method: RequestMethods, expected_response: ZodSchema<T>) {
    var response = null;
    try {
      response = await fetch(HTTPSHOST() + url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(json_body),
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