import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.id);

      axios
        .get("http://localhost:8080/sheets") // Fetch all sheets
        .then((response) => {
          console.log("Fetched sheets:", response.data); // Debug response
          setSheets(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching sheets:", error);
          setLoading(false);
        });
    } else {
      console.error("No token found");
      setLoading(false);
    }
  }, []);

  const handleCreateSpreadsheet = async () => {
    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    try {
      const nextSequence = sheets.length + 1;
      const response = await axios.post("http://localhost:8080/sheets", {
        userId, // Use the actual userId here
        title: `Sheet/User${userId}/${nextSequence}`,
        data: Array.from({ length: 20 }, () =>
          Array.from({ length: 9 }, () => "")
        ),
      });

      const newSheet = response.data;
      setSheets((prevSheets) => [...prevSheets, newSheet]);
      navigate(`/sheet/${newSheet._id}`);
    } catch (error) {
      console.error(
        "Error creating spreadsheet:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleDelete = async (sheetId) => {
    try {
      await axios.delete(`http://localhost:8080/sheets/${sheetId}`);
      setSheets((prevSheets) =>
        prevSheets.filter((sheet) => sheet._id !== sheetId)
      );
    } catch (error) {
      console.error("Error deleting spreadsheet:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Your Sheets</h1>
      <button
        onClick={handleCreateSpreadsheet}
        className="bg-green-500 text-white p-2 rounded mb-6 hover:bg-green-600"
      >
        Create Spreadsheet
      </button>
      {loading ? (
        <p>Loading your spreadsheets...</p>
      ) : (
        <ul>
          {sheets.length > 0 ? (
            sheets.map((sheet) => (
              <li key={sheet._id} className="mb-4 flex items-center">
                <Link
                  to={`/sheet/${sheet._id}`}
                  className="text-blue-500 underline flex-1"
                >
                  {sheet.title}
                </Link>
                <button
                  onClick={() => handleDelete(sheet._id)}
                  className="bg-red-500 text-white p-2 rounded ml-4 hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p>No spreadsheets available.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Home;
