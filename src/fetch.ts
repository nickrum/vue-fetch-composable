import { ref, isRef, unref, watch, onMounted, Ref } from 'vue';

function checkStatus(res: Response): Response {
  if (!res.ok) {
    throw new Error(res.status + ' ' + res.statusText);
  }
  return res;
}

function fetchData(
  urlRef: Ref | string,
  {
    method,
    body,
    headers,
    root,
    request,
    response,
    fetch
  }: {
    method: string;
    body: Ref<object | null>;
    headers: Ref<Headers | null>;
    root: string;
    request: (req: object) => string;
    response: (res: Response) => Promise<object>;
    fetch: (
      input: RequestInfo,
      init?: RequestInit | undefined
    ) => Promise<Response>;
  },
  {
    data,
    loading,
    error
  }: {
    data: Ref<object | null>;
    loading: Ref<boolean>;
    error: Ref<Error | null>;
  }
) {
  const url = unref(urlRef);

  if (url !== null) {
    loading.value = true;

    fetch(root + url, {
      method,
      headers: headers.value ? headers.value : undefined,
      body: body.value ? request(body.value) : undefined
    })
      .then(checkStatus)
      .then(response)
      .then((d: object) => {
        data.value = d;
        loading.value = false;
      })
      .catch((e: Error) => {
        error.value = e;
        loading.value = false;
      });
  }
}

export function createFetch({
  method = 'GET',
  body = ref(null),
  headers = ref(null),
  root = '',
  watching = true,
  immediate = true,
  sender = (f: () => void) => f,
  request = (req: object) => JSON.stringify(req),
  response = (res: Response) => res.json(),
  fetch = window.fetch
}: {
  method?: string;
  body?: Ref<object | null>;
  headers?: Ref<Headers | null>;
  root?: string;
  watching?: boolean;
  immediate?: boolean;
  sender?: (f: () => void) => () => void;
  request?: (req: object) => string;
  response?: (res: Response) => Promise<object>;
  fetch?: (
    input: RequestInfo,
    init?: RequestInit | undefined
  ) => Promise<Response>;
} = {}) {
  const options = {
    method,
    body,
    headers,
    root,
    watching,
    immediate,
    sender,
    request,
    response,
    fetch
  };

  return function useFetch(
    url: Ref | string,
    {
      method = options.method,
      body = options.body,
      headers = options.headers,
      root = options.root,
      watching = options.watching,
      immediate = options.immediate,
      sender = options.sender,
      request = options.request,
      response = options.response,
      fetch = options.fetch
    }: {
      method?: string;
      body?: Ref<object | null>;
      headers?: Ref<Headers | null>;
      root?: string;
      watching?: boolean;
      immediate?: boolean;
      sender?: (f: () => void) => () => void;
      request?: (req: object) => string;
      response?: (res: Response) => Promise<object>;
      fetch?: (
        input: RequestInfo,
        init?: RequestInit | undefined
      ) => Promise<Response>;
    } = {}
  ) {
    const data: Ref<object | null> = ref(null);
    const loading: Ref<boolean> = ref(false);
    const error: Ref<Error | null> = ref(null);

    const send = sender(
      fetchData.bind(
        null,
        url,
        { method, body, headers, root, request, response, fetch },
        { data, loading, error }
      )
    );

    if (immediate) {
      onMounted(() => {
        send();
      });
    }

    if (watching) {
      watch(
        [body, headers].concat(isRef(url) ? [url] : []),
        () => {
          send();
        },
        { deep: true }
      );
    }

    return { data, loading, error, send };
  };
}
