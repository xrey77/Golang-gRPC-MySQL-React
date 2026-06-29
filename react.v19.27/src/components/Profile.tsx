import React, { useState, useEffect } from "react";
import jQuery from 'jquery';
import { ConnectError, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { UserService } from "../_schema/userv1/user_pb"; 
import { MfaService } from "../_schema/mfav1/mfa_pb";
import { UploadPictureService } from "../_schema/uploadv1/uploadImage_pb";

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


const userclient = createClient(UserService, transport);
const mfaClient = createClient(MfaService, transport);
const uploadClient = createClient(UploadPictureService, transport);

export default function Profile() {    
    const [userid, setUserid] = useState<string>("");;
    const [lname, setLname] = useState<string>('');
    const [fname, setFname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [mobile, setMobile] = useState<string>('');
    const [userpicture, setUserpicture] = useState<string>('');
    const [newpassword, setNewPassword ] = useState<string>('');
    const [confnewpassword, setConfNewPassword ] = useState<string>('');    
    const [profileMsg, setProfileMsg] = useState<string>('');
    const [showmfa, setShowMfa] = useState<boolean>(false);
    const [showpwd, setShowPwd] = useState<boolean>(false);
    const [showupdate, setShowUpdate] = useState<boolean>(false);
    const [qrcodeurl, setQrcodeurl] = useState<string>('');

    useEffect(() => {
        const xidno = sessionStorage.getItem('USERID') || '';
        queueMicrotask(() => {
            setUserid(xidno !== null ? xidno : '')
            // setToken(xtoken !== null ? xtoken : '');
        });
        const fetchUserData = async () => {
            try {
                const response = await userclient.getUser({ id: xidno });

                const userpic = `http://localhost:8080/assets/users/${response.user?.userPic}`;
                const qrcode = response.user?.qrcodeurl ?? '';
                setQrcodeurl(qrcode)
                const f_name = response.user?.firstName ?? '';
                const l_name = response.user?.lastName ?? '';
                const l_email = response.user?.email ?? '';
                const mobileno = response.user?.mobile ?? '';
                setFname(f_name);
                setLname(l_name);
                setEmail(l_email)
                setMobile(mobileno);
                setUserpicture(userpic);
                setQrcodeurl(qrcode);

            } catch (err) {
                const connectErr = ConnectError.from(err);
                console.log(ConnectError);
                const cleanMessage = connectErr.rawMessage.includes("desc = ")
                ? connectErr.rawMessage.split("desc = ")[1]
                : connectErr.rawMessage;
                setProfileMsg(cleanMessage);
            }
        };

        fetchUserData();

    }, [userid]);

    const submitProfile = async (event: React.MouseEvent<HTMLButtonElement>) => {  
        event.preventDefault();
        try {
            const response = await userclient.updateUserProfile(
                { 
                    id: userid,
                    firstname: fname,
                    lastname: lname,
                    mobile: mobile
                }
            );
            setProfileMsg(response.textContent ?? '');
            setTimeout(() => { setProfileMsg(''); }, 3000);
        } catch (err) {
            const connectErr = ConnectError.from(err);
            console.log(ConnectError);
            const cleanMessage = connectErr.rawMessage.includes("desc = ")
            ? connectErr.rawMessage.split("desc = ")[1]
            : connectErr.rawMessage;
            setProfileMsg(cleanMessage);
            setTimeout(() => { setProfileMsg(''); }, 3000);
        }
    }

    const changePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const pix = URL.createObjectURL(file);
        jQuery('#userpic').attr('src', pix);

        const reader = new FileReader();
        reader.onload = async (e) => {
            if (!e.target?.result) return;
            
            const arrayBuffer = e.target.result as ArrayBuffer;
            const fileBytes = new Uint8Array(arrayBuffer);

            try {
                const response = await uploadClient.uploadProfilePicture({ 
                    id: userid,
                    fileData: fileBytes,
                    filename: file.name
                });
                
                setProfileMsg(response.textContent ?? '');
                const userpic = `http://localhost:8080/assets/users/${response.userpicture}`;
                setUserpicture(userpic);
                setTimeout(() => { setProfileMsg(''); }, 3000);
            } catch (err) {
                const connectErr = ConnectError.from(err);
                const cleanMessage = connectErr.rawMessage.includes("desc = ")
                    ? connectErr.rawMessage.split("desc = ")[1]
                    : connectErr.rawMessage;
                setProfileMsg(cleanMessage);
                setTimeout(() => { setProfileMsg(''); }, 3000);
            }
        };
        
        reader.readAsArrayBuffer(file);
    }


    const cpwdCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setShowUpdate(true);
            setShowPwd(true);
            setShowMfa(false);
            jQuery('#checkTwoFactor').prop('checked', false);
            return;
        } else {
            setNewPassword('');
            setConfNewPassword('');
            setShowPwd(false);
            setShowUpdate(false)
        }
    }

    const mfaCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setShowMfa(true);
            setShowUpdate(true)
            setShowPwd(false);
            if (qrcodeurl.length > 0) {
                const qrcode = qrcodeurl;
                setQrcodeurl(qrcode);
            } else {
                setQrcodeurl("http://localhost:8080/assets/images/qrcode.png");
            }
        } else {
            setShowMfa(false);
            setShowUpdate(false)
        }
    }

    const enableMFA = async () => {
        try {
            const response = await mfaClient.mfaActivation(
                { 
                    id: userid,
                    twofactorenabled: true
                }
            );
            setProfileMsg(response.textContent ?? '');
            setQrcodeurl(response.qrcodeurl ?? '');
            setTimeout(() => { setProfileMsg(''); }, 3000);
        } catch (err) {
            const connectErr = ConnectError.from(err);
            console.log(ConnectError);
            const cleanMessage = connectErr.rawMessage.includes("desc = ")
            ? connectErr.rawMessage.split("desc = ")[1]
            : connectErr.rawMessage;
            setProfileMsg(cleanMessage);
            setTimeout(() => { setProfileMsg(''); }, 3000);
        }
    }

    const disableMFA = async () => {
        try {
            const response = await mfaClient.mfaActivation(
                { 
                    id: userid,
                    twofactorenabled: false
                }
            );
            setProfileMsg(response.textContent ?? '');
            const qrcode = "http://localhost:8080/assets/images/qrcode.png";
            setQrcodeurl(qrcode);
            setTimeout(() => { setProfileMsg(''); }, 3000);
        } catch (err) {
            const connectErr = ConnectError.from(err);
            console.log(ConnectError);
            const cleanMessage = connectErr.rawMessage.includes("desc = ")
            ? connectErr.rawMessage.split("desc = ")[1]
            : connectErr.rawMessage;
            setProfileMsg(cleanMessage);
            setTimeout(() => { setProfileMsg(''); }, 3000);
        }

    }

    const changePassword = async (event: React.MouseEvent<HTMLButtonElement>) => {  
        event.preventDefault();
        if (newpassword === '') {
            setProfileMsg("Please enter new Pasword.");
            setTimeout(() => {
                setProfileMsg('');
            },3000);
            return;
        }
        if (confnewpassword === '') {
            setProfileMsg("Please enter new Pasword confirmation.");
            setTimeout(() => {
                setProfileMsg('');
            },3000);
            return;            
        }

        if (newpassword !== confnewpassword) {
            setProfileMsg("new Password does not matched.");
            setTimeout(() => {
                setProfileMsg('');
            },3000);
            return;            
        }
            try {
                const response = await userclient.changePassword(
                    { 
                        id: userid,
                        password: newpassword
                    }
                );
                setProfileMsg(response.textContent ?? '');
                setTimeout(() => { setProfileMsg(''); }, 3000);
            } catch (err) {
                const connectErr = ConnectError.from(err);
                console.log(ConnectError);
                const cleanMessage = connectErr.rawMessage.includes("desc = ")
                ? connectErr.rawMessage.split("desc = ")[1]
                : connectErr.rawMessage;
                setProfileMsg(cleanMessage);
                setTimeout(() => { setProfileMsg(''); }, 3000);
            }


    }

    return (
      <div className='profile-bg'>
        <div className="card card-profile mt-3">
        <div className="card-header bg-primary">
            <h3 className="text-white">User Profile ID No. {userid}</h3>
        </div>
        <div className="card-body">
        <form encType="multipart/form-data" autoComplete='false'>
                <div className='row'>
                    <div className='col'>
                        <input className="form-control bg-warning text-dark border-primary" id="firstname" name="firstname" type="text" value={fname} onChange={e => setFname(e.target.value)} required  />
                        <input className="form-control bg-warning text-dark border-primary mt-2" id="lastname" name="lastname" type="text" value={lname} onChange={e => setLname(e.target.value )} required />
                    </div>
                    <div className='col text-right'>

                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <input className="form-control bg-warning border-primary mt-2" id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} readOnly />
                    </div>
                    <div className='col'>
                        <img id="userpic" src={userpicture} className="userpic" alt="" />
                    </div>
                </div>


                <div className='row'>
                    <div className='col'>
                            <input className="form-control bg-warning border-primary mt-2" id="mobileno" name="mobileno" type="text" value={mobile} onChange={e => setMobile(e.target.value)} required />
                    </div>
                    <div className='col'>
                        <input className="userpicture mt-2" onChange={changePicture} type="file"/>
                    </div>
                </div>

                <div className='row'>
                    {/* 2-FACTOR AUTHENTICATION */}
                    <div className='col'>
                            <div className="form-check mt-2">
                                <input onChange={mfaCheckbox} className="form-check-input chkbox" type="checkbox" id="checkTwoFactor"/>
                                <label className="form-check-label" htmlFor="checkTwoFactor">
                                    Enable 2-Factor Authentication
                                </label>
                            </div>
                            {
                                showmfa === true ? (
                                    <div className='row'>
                                        <div className='col-5'>
                                            <img src={qrcodeurl} className="qrCode2" alt="QRCODE" />
                                        </div>
                                        <div className='col-7   '>
                                            <p className='text-danger mfa-pos-1'><strong>Requirements</strong></p>
                                            <p className="mfa-pos-2 qrlabel-size">You need to install <strong>Google or Microsoft Authenticator</strong> in your Mobile Phone, once installed, click Enable Button below, and <strong>SCAN QR CODE</strong>, next time you login, another dialog window will appear, then enter the <strong>OTP CODE</strong> from your Mobile Phone in order for you to login.</p>
                                            <button onClick={enableMFA} type="button" className='btn btn-primary mfa-btn-1 mx-1'>enable</button>
                                            <button onClick={disableMFA} type="button" className='btn btn-secondary mfa-btn-2'>disable</button>
                                        </div>
                                    </div>
                                )
                                :
                                null
                            }

                    </div>
                    <div className='col'>
                            {/* CHANGE PASSWORD */}
                            <div className="form-check mt-2">
                            <input onChange={cpwdCheckbox} className="form-check-input chkbox" type="checkbox" id="checkChangePassword"/>
                            <label className="form-check-label" htmlFor="checkChangePassword">
                                Change Password
                            </label>
                        </div>
                        { showpwd === true ? (
                            <>
                              <input className="form-control text-dark border-primary mt-2" type="password" id="newPassword" value={newpassword} onChange={e => setNewPassword(e.target.value)} autoComplete="off" placeholder='enter new Password'/>
                              <input className="form-control text-dark border-primary mt-1" type="password" id="confNewPassword" value={confnewpassword} onChange={e => setConfNewPassword(e.target.value)} autoComplete="off" placeholder='confirm new Password'/>
                              <button onClick={changePassword} className='btn btn-primary mt-2' type="button">change password</button>
                            </>
                        )
                        :
                            null
                        }

                    </div>
                </div> 
                {
                    showupdate === false ? (
                        <button onClick={submitProfile} type='submit' className='btn btn-primary text-white mt-2'>update profile</button>
                    )
                    :
                    null
                }
                </form>
        </div>
        <div className="card-footer text-danger">
            {profileMsg}
        </div>
        </div>
    </div>    
  )
}
