import { useState, useEffect } from 'react';
import { ConnectError, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ProductService } from '../schema/productv1/product_pb';
import { type ProductData } from '../schema/productv1/product_pb';

const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});

const productClient = createClient(ProductService, transport);

export default function Prodlist() {

  const toDecimal = (amt: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const price = parseFloat(amt);
    return formatter.format(price);
  };


    const [page, setPage] = useState<bigint>(1n);
    const [totpage, setTotpage] = useState<bigint>(0n);
    const [totalrecs, setTotalrecs] = useState<bigint>(0n);
    const [message, setMessage] = useState<string>('');
    const [products, setProducts] = useState<ProductData[]>([]);

    const fetchProds = async (pg: bigint) => {
        try {
            const response = await productClient.getProductList(
                {               
                  page: BigInt(pg)
                }
            );
            setProducts(response.products);
            setPage(response.page);
            setTotpage(response.totalPages);
            
            setTotalrecs(response.totalRecords);
            

        } catch (err) {

            const connectErr = ConnectError.from(err);
            console.log(ConnectError);
            const cleanMessage = connectErr.rawMessage.includes("desc = ")
            ? connectErr.rawMessage.split("desc = ")[1]
            : connectErr.rawMessage;
            setMessage(cleanMessage);
            setTimeout(() => {
              setMessage('');
            }, 3000);
        }
    }


    useEffect(() => {
      const fetchProducts = async (pg: bigint) => {
          try {
              const response = await productClient.getProductList(
                  {               
                    page: BigInt(pg)
                  }
              );
              setProducts(response.products);
              setPage(response.page);
              setTotpage(response.totalPages);
              
              setTotalrecs(response.totalRecords);
              

          } catch (err) {

              const connectErr = ConnectError.from(err);
              console.log(ConnectError);
              const cleanMessage = connectErr.rawMessage.includes("desc = ")
              ? connectErr.rawMessage.split("desc = ")[1]
              : connectErr.rawMessage;
              setMessage(cleanMessage);
              setTimeout(() => {
                setMessage('');
              }, 3000);
          }

      }

      fetchProducts(page);
   },[page]);

    const firstPage = (event: React.MouseEvent<HTMLAnchorElement>) => { 
        event.preventDefault();
        fetchProds(1n);  
        return;    
      }
    
      const nextPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();    
        if (page == totpage) {
            setPage(totpage);
            return;
        }
        let pg: bigint = page;
        pg++;
        setPage(pg);
        return fetchProds(pg);
      }
    
      const prevPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();    
        if (page === 1n) {
          return;
          }
          let pg: bigint = page;
          pg--;
          setPage(pg);
          return fetchProds(pg);
      }
    
      const lastPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const pg = totpage;
        setPage(pg);
        return fetchProds(pg);
      }  
  
  return (
    <div className="container">
            <h1 className='text-warning embossed mt-3'>Products List</h1>
            <div>{message}</div>
            <table className="table table-danger table-striped">
            <thead>
                <tr>
                <th className="bg-primary text-white" scope="col">#</th>
                <th className="bg-primary text-white" scope="col">Descriptions</th>
                <th className="bg-primary text-white" scope="col">Qty</th>
                <th className="bg-primary text-white" scope="col">Unit</th>
                <th className="bg-primary text-white" scope="col">Price</th>
                </tr>
            </thead>
            <tbody>

            {products.map((item) => {
            return (
              <tr key={item['id']}>
                 <td>{item['id']}</td>
                 <td>{item['descriptions']}</td>
                 <td>{item['qty']}</td>
                 <td>{item['unit']}</td>
                 <td>&#8369;{toDecimal(item['sellPrice'])}</td>
               </tr>
              );
            })}

            </tbody>
            </table>

            <nav aria-label="Page navigation example">
        <ul className="pagination sm">
          <li className="page-item"><a onClick={lastPage} className="page-link sm" href="/#">Last</a></li>
          <li className="page-item"><a onClick={prevPage} className="page-link sm" href="/#">Previous</a></li>
          <li className="page-item"><a onClick={nextPage} className="page-link sm" href="/#">Next</a></li>
          <li className="page-item"><a onClick={firstPage} className="page-link sm" href="/#">First</a></li>
          <li className="page-item page-link text-danger sm">Page&nbsp;{page} of&nbsp;{totpage}</li>

        </ul>
      </nav>
      <div className='text-warning'><strong>Total Records : {totalrecs}</strong></div>
    </div>    
  )
}
