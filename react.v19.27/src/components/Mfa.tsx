import { useState } from "react"
import jQuery from "jquery";
import { ConnectError, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { MfaService } from "../_schema/mfav1/mfa_pb";

const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
  interceptors: [
    (next) => async (req) => {
      const token = sessionStorage.getItem('TOKEN');
      if (token) {
        req.header.set("authorization", `Bearer ${token}`); 
      }
      return await next(req);
    },
  ],
});


const mfaclient = createClient(MfaService, transport);

export default function Mfa() {
  const [otp, setOtp] = useState<string>('');
  const [message, setMessage] = useState<string>('');
    const [isdisabled, setIsdisabled] = useState<boolean>(false);

  const submitMfa = async (event: React.SubmitEvent<HTMLFormElement>) => { 
    event.preventDefault();
    setIsdisabled(true);
    const userid = sessionStorage.getItem('USERID') || '';

    try {
        const response = await mfaclient.mfaVerification(
            {               
                id: userid,
                otp: otp
            }
        );
        setMessage(response.textContent ?? '');
        const usrname = response.username ?? '';
        sessionStorage.setItem("USERNAME", usrname );
        setTimeout(() => {
          setMessage('');
          jQuery("#mfaReset").trigger('click');
          location.reload();
        }, 3000);


    } catch (err) {

        const connectErr = ConnectError.from(err);
        console.log(ConnectError);
        const cleanMessage = connectErr.rawMessage.includes("desc = ")
        ? connectErr.rawMessage.split("desc = ")[1]
        : connectErr.rawMessage;
        setMessage(cleanMessage);
        setTimeout(() => {
          setMessage('');
          setOtp('');
          setIsdisabled(false);
        }, 3000);
        return;
    }
  }

  const closeMfa = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setMessage('');
    setOtp('');
    sessionStorage.removeItem('USERID');
    sessionStorage.removeItem('USERNAME');
    sessionStorage.removeItem('USERPIC');
    sessionStorage.removeItem('TOKEN');
    location.reload();
  }

  return (
    <div className="modal fade" id="staticMfa" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticMfaLabel" aria-hidden="true">
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-info">
            <div className="modal-title fs-5 text-dark" id="staticMfaLabel">Multi-Factor Authenticator</div>
            <button onClick={closeMfa} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
          <form onSubmit={submitMfa} autoComplete="off">
            <div className="mb-3">
              <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="form-control border-dark" id="otp" placeholder="enter 6-digin OTP code" disabled={isdisabled}/>
            </div>          
            <div className="mb-3">
              <button type="submit" className="btn btn-info mx-2 text-dark" disabled={isdisabled}>submit</button>
              <button type="reset" className="btn btn-info text-dark">reset</button>
            </div>
          </form>            
          </div>
          <div className="modal-footer">
            <div className="w-100 text-center text-danger">{message}</div>
          </div>
        </div>
      </div>
    </div>    
  )
}
        
