import { useState } from "react";
import profileixon from "../../images/profileicon.png";
import "./Profile.css";

interface Userinfo {
  name: string;
  username: string;
}

const Profile = () => {
  const [userinfo, setuserinfo] = useState<Userinfo | null>(null);
  return (
    <>
      <section className="d-flex justify-content-center align-items-center mx-auto p-5">
        <div className="row col-12">
          <div className="profile-section col-md-3 card d-flex align-items-center">
            <h4 className="h4">Profile Info</h4>
            <img
              src={profileixon}
              alt="Profile Icon"
              height="100px"
              width="100px"
            />
            <p className="">Name : {userinfo?.name || "Md. Numanur Rahman"}</p>
            <p>Username : {userinfo?.username || "noman011"}</p>
          </div>
          <div className="col-md-8 project-section container">
            <div className="d-flex justify-content-around align-items-center">
              <h4 className="h4">Your Projects</h4>
              <button className="create-project-button">
                Create New Project
              </button>
            </div>
            <div className="text-center mt-5">
              <p>No Project available.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
