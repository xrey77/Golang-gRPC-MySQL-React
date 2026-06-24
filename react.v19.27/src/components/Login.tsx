import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Mfa from "./Mfa.tsx";
import jQuery from "jquery";
import { ConnectError, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { LoginService } from "../schema/loginv1/login_pb"; 

const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});

const client = createClient(LoginService, transport);

export default function Login() {
   const [username, setUsername] = useState<string>('');
   const [password, setPassword] = useState<string>('')
   const [message, setMessage] = useState<string>('');
   const [isdiabled, setIsdisabled] = useState(false);
   const navigate = useNavigate();
    
   const submitLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {   
    event.preventDefault();
    setMessage('please wait...');
    setIsdisabled(true);


    try {
      const response = await client.login({
        username: username,
        password: password,
      }); 
      
      setMessage(response.data?.textContent ?? '');
      const userpic: string = `http://localhost:8080/assets/users/${response.data?.userPic}`;
      const userId = response.data?.id?.toString() ?? '';
      const usernameValue = response.data?.username ?? '';
      const qrcodeUrl = response.data?.qrcodeurl ?? '';
        // const roles = response.data?.roles ?? '';
      const token = response.data?.token ?? '';

      if (qrcodeUrl.length > 0) {
          window.sessionStorage.setItem('USERID', userId); 
          window.sessionStorage.setItem('TOKEN',response.data?.token ?? '');
          // window.sessionStorage.setItem('ROLE',response.data?.roles);
          window.sessionStorage.setItem('USERPIC', userpic);
          jQuery("#loginReset").trigger("click");
          setIsdisabled(false);
          jQuery("#mfaModal").trigger("click");
      } else {
          window.sessionStorage.setItem('USERID', userId);
          window.sessionStorage.setItem('USERNAME', usernameValue);
          window.sessionStorage.setItem('TOKEN', token);                        
          // window.sessionStorage.setItem('ROLE',res.data.roles);
          window.sessionStorage.setItem('USERPIC', userpic);
          setIsdisabled(false);
          jQuery("#loginReset").trigger('"click')
          navigate('/'); 
          location.reload();
      }
      


    } catch (err) {

      const connectErr = ConnectError.from(err);
      const cleanMessage = connectErr.rawMessage.includes("desc = ")
      ? connectErr.rawMessage.split("desc = ")[1]
      : connectErr.rawMessage;

      setMessage(cleanMessage);
      setTimeout(() => {
          setMessage('');
        }, 3000);
            
    } finally {
      setIsdisabled(false);
    }
  }

  const closeLogin = (event: React.MouseEvent<HTMLButtonElement>) => {    
    event.preventDefault();
    setIsdisabled(false);    
    setMessage('');
    setUsername('');
    setPassword('');
  }

  return (
    <>
<div className="modal fade" id="staticLogin" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticLoginLabel" aria-hidden="true">
  <div className="modal-dialog modal-sm modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header bg-violet">
        <h1 className="modal-title text-white fs-5" id="staticLoginLabel">User's Login</h1>
        <button onClick={closeLogin} type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <form onSubmit={submitLogin} autoComplete="off">
        <div className="mb-3">
          <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="form-control border-secondary border-emboss" disabled={isdiabled} autoComplete='off' placeholder="enter Username"/>
        </div>          
        <div className="mb-3">
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="form-control border-secondary border-emboss" disabled={isdiabled} autoComplete='off' placeholder="enter Password"/>
        </div>          
        <div className="mb-3">
          <button type="submit" className="btn btn-violet text-white mx-2" disabled={isdiabled}>login</button>
          <button id="loginReset" onClick={closeLogin} type="reset" className="btn btn-violet text-white">reset</button>
          <button id="mfaModal" type="button" className="btn btn-warning d-none" data-bs-toggle="modal" data-bs-target="#staticMfa">mfa</button>

          </div>
        </form>
      </div>
      <div className="modal-footer">
        <div className="w-100 text-danger">{message}</div>
      </div>
    </div>
  </div>
</div>    
<Mfa/>
</>
  )
}
