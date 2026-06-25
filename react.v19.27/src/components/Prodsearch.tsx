import { useState } from 'react';
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


export default function Prodsearch() {
    const [page, setPage] = useState<bigint>(1n);
    const [totpage, setTotpage] = useState<bigint>(0n);
    const [totalrecs, setTotalrecs] = useState<bigint>(0n);
    const [message, setMessage] = useState<string>('');
    const [products, setProducts] = useState<ProductData[]>([]);

  const [searchkey, setSearchkey] = useState<string>('');

  const getProdsearch = async (event: React.SubmitEvent<HTMLFormElement>) => { 
      event.preventDefault();
      getProdPage(page);
      setMessage("please wait .");
  }

  const getProdPage = async (pg: bigint) => {
        try {
            const response = await productClient.getProductSearch(
                {               
                  page: BigInt(pg),
                  keyword: searchkey
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

    const firstPage = (event: React.MouseEvent<HTMLAnchorElement>) => { 
        event.preventDefault();
        getProdPage(1n);  
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
        return getProdPage(pg);
      }
    
      const prevPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();    
        if (page === 1n) {
          return;
          }
          let pg: bigint = page;
          pg--;
          setPage(pg);
          return getProdPage(pg);
      }
    
      const lastPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const pg = totpage;
        setPage(pg);
        return getProdPage(pg);
      }  
  

  

return (
  <div className="container mb-10">
      <h2 className='text-warning embossed mt-3'>Products Search</h2>

      <form className="row g-3" onSubmit={getProdsearch} autoComplete='off'>
          <div className="col-auto">
            <input type="text" required className="form-control-sm" value={searchkey} onChange={e => setSearchkey(e.target.value)} placeholder="enter Product keyword"/>
            <div className='searcMsg text-warning'>{message}</div>
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary btn-sm mb-3">search</button>
          </div>

      </form>
      <div className="container mb-9">
        <div className="card-group">
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
        {
          totpage > 1 ? 
          <>
          <nav aria-label="Page navigation example">
            <ul className="pagination sm mt-3">
              <li className="page-item"><a onClick={lastPage} className="page-link sm" href="/#">Last</a></li>
              <li className="page-item"><a onClick={prevPage} className="page-link sm" href="/#">Previous</a></li>
              <li className="page-item"><a onClick={nextPage} className="page-link sm" href="/#">Next</a></li>
              <li className="page-item"><a onClick={firstPage} className="page-link sm" href="/#">First</a></li>
              <li className="page-item page-link text-danger sm">Page&nbsp;{page} of&nbsp;{totpage}</li>
            </ul>
          </nav>
          <div className='text-warning'><strong>Total Records : {totalrecs}</strong></div>
          </>
        :
        null
        }

        <br/><br/><br/>
      </div>
  </div>  
  )
}

