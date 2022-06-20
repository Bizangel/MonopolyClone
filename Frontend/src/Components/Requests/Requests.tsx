
export const RequestManager = {
  async performPOST(url: string, json_payload: Object) {
    var x = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json_payload),
    });
    return x.json();
  }

}