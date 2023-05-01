import { useEffect, useState, useRef } from "react";

export default function App() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();
  const lastElement = (node) => {
    if (isLoading) {
      return;
    }
    if (observer.current) {
      // dicsocnnect old observer element so new last element can be observed
      console.log("observer disconnected");
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      console.log("in", entries);

      if (entries[0].isIntersecting && hasMore) {
        console.log("here");
        setPage((prev) => {
          return prev + 1;
        });
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  };
  console.log(observer.current);
  const fetchData = async () => {
    setIsLoading(true);
    const response = await fetch(
      "https://openlibrary.org/search.json?" +
        new URLSearchParams({
          q: query,
          page: page
        })
    );
    const dataJson = await response.json();

    setData([...dataJson.docs]);
    setIsLoading(false);
    console.log(data);
    if (data.length > 0) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [query, page]);

  const handleChange = (e) => {
    let timer = null;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      setQuery(e.target.value);
      setPage(1); // for new query result shoud from start page 1
    }, 1000);
  };
  return (
    <div className="App">
      <div>
        <input
          type="text"
          placeholder="Search Book"
          onChange={(e) => {
            handleChange(e);
          }}
        />
      </div>

      <div>
        {data.map((obj, index) => {
          if (index === data.length - 1) {
            // function is called once when elments loads
            return (
              <div
                ref={(node) => {
                  lastElement(node);
                }}
                key={obj.key}
              >
                {obj.title}
              </div>
            );
          } else {
            return <div key={obj.key}>{obj.title}</div>;
          }
        })}
      </div>
      {isLoading ? <div>Loading ...</div> : ""}
    </div>
  );
}
