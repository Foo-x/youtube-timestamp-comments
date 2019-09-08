export const fetchInitialConfig = () => {
  return new Promise(resolve => {
    document.addEventListener("youtube-timestamp-comments-get-config", data => {
      fetchInitialConfigScript.remove();
      const {
        ID_TOKEN,
        INNERTUBE_CONTEXT_CLIENT_VERSION,
        PAGE_BUILD_LABEL,
        PAGE_CL,
        VARIANTS_CHECKSUM,
        XSRF_TOKEN
      } = data.detail;

      resolve({
        ID_TOKEN,
        INNERTUBE_CONTEXT_CLIENT_VERSION,
        PAGE_BUILD_LABEL,
        PAGE_CL,
        VARIANTS_CHECKSUM,
        XSRF_TOKEN
      });
    });
    const fetchInitialConfigScript = document.createElement("script");
    fetchInitialConfigScript.text = `
      // define variables in each block
      {
        const {
          ID_TOKEN,
          INNERTUBE_CONTEXT_CLIENT_VERSION,
          PAGE_BUILD_LABEL,
          PAGE_CL,
          VARIANTS_CHECKSUM,
          XSRF_TOKEN
        } = ytcfg.data_;
        document.dispatchEvent(new CustomEvent("youtube-timestamp-comments-get-config", {
          detail: {
            ID_TOKEN,
            INNERTUBE_CONTEXT_CLIENT_VERSION,
            PAGE_BUILD_LABEL,
            PAGE_CL,
            VARIANTS_CHECKSUM,
            XSRF_TOKEN
          }
        }));
      }
    `;
    (document.head || document.documentElement).appendChild(
      fetchInitialConfigScript
    );
  });
};
