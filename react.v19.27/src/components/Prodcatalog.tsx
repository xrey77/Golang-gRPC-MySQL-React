import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ConnectError, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ProductService } from '../schema/productv1/product_pb';
import { type ProductData } from '../schema/productv1/product_pb';

const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});

const productClient = createClient(ProductService, transport);

  const toDecimal = (amt: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const price = parseFloat(amt);
    return formatter.format(price);
  };


export default function Prodcatalog() {
    const [page, setPage] = useState<bigint>(1n);
    const [totpage, setTotpage] = useState<bigint>(0n);
    const [totalrecs, setTotalrecs] = useState<bigint>(0n);
    const [message, setMessage] = useState<string>('');
    const [products, setProducts] = useState<ProductData[]>([]);

    const fetchCatalog = async (pg: bigint) => {
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

      fetchProducts(page)
    },[page]);

    const firstPage = (event: React.MouseEvent<HTMLAnchorElement>) => { 
        event.preventDefault();
        fetchCatalog(1n);  
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
        return fetchCatalog(pg);
      }
    
      const prevPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();    
        if (page === 1n) {
          return;
          }
          let pg: bigint = page;
          pg--;
          setPage(pg);
          return fetchCatalog(pg);
      }
    
      const lastPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const pg = totpage;
        setPage(pg);
        return fetchCatalog(pg);
      }  


    return(
    <div className="container mt-2 mb-9">
            <h3 className="text-warning embossed mt-3">Products Catalog</h3>
            <div className="text-warning">{message}</div>
            <div className="card-group mb-3">
            {products.map((item) => {
                    return (
                      <div className='col-md-4'>
                      <div key={item['id']} className="card mx-3 mt-3">
                          <img src={`http://localhost:8080/assets/products/${item['productPicture']}`} className="card-img-top product-size" alt=""/>
                          <div className="card-body">
                            <h5 className="card-title">Descriptions</h5>
                            <p className="card-text desc-h">{item['descriptions']}</p>
                          </div>
                          <div className="card-footer">
                            <p className="card-text text-danger"><span className="text-dark">PRICE :</span>&nbsp;<strong>&#8369;{toDecimal(item['sellPrice'])}</strong></p>
                          </div>  
                      </div>
                      
                      </div>
        
                      );
            })}
          </div>    

        <div className='container'>
        <nav aria-label="Page navigation example">
        <ul className="pagination sm">
          <li className="page-item"><Link onClick={lastPage} className="page-link sm" to="/#">Last</Link></li>
          <li className="page-item"><Link onClick={prevPage} className="page-link sm" to="/#">Previous</Link></li>
          <li className="page-item"><Link onClick={nextPage} className="page-link sm" to="/#">Next</Link></li>
          <li className="page-item"><Link onClick={firstPage} className="page-link sm" to="/#">First</Link></li>
          <li className="page-item page-link text-danger sm">Page&nbsp;{page} of&nbsp;{totpage}</li>
        </ul>
      </nav>
      <div className='text-warning'><strong>Total Records : {totalrecs}</strong></div>

      <br/><br/>
      </div>
  </div>
  )
}
