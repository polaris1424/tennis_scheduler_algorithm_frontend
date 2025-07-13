"use client";

import { useEffect, useState } from 'react';
import { Select, Button, Upload, message, Table, Spin, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { Team, Season } from '../../utils/interfaces';  //  TypeScript Interfaces
import Cookies from 'js-cookie'; // Import js-cookie
import axios from 'axios';
import apiConfig from '@/app/utils/apiConfig';
import { useRouter } from 'next/navigation';
import withAuth from '@/app/utils/withAuth';
import * as XLSX from 'xlsx';  // npm install xlsx



const { Option } = Select;

const Competitions = () => {

  const [username, setUsername] = useState("Guest");
  const [email, setEmail] = useState("xxx@mail.com");

  useEffect(() => {
    if (typeof window !== 'undefined') { // make sure it is in a proper browser window
      const storedUsername = localStorage.getItem("username") || "Guest";
      const storedEmail = localStorage.getItem("email") || "xxx@mail.com";
      setUsername(storedUsername);
      setEmail(storedEmail);
    }

    fetchCompetitions(); // Fetch competitions data every time the component is mounted
  }, []); // Removed the empty dependency array


  //const [seasons] = useState(generateSeasonsData()); // simulate competition data
  // const [seasons, setSeasons] = useState<Season[]>([]); // Initialize as empty array
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(""); // default select as the first competition
  // const [tableData, setTableData] = useState(seasons[0].teams); // default display of the first competition
  const [uploading, setUploading] = useState(false); // control upload progress

  const [competitionData, setCompetitionData] = useState([])
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter(); // Initialize useRouter hook

  const [scheduleData, setScheduleData] = useState<any[]>([]);  // store form data

  // generating columns based on data
  const columns = scheduleData.length > 0
      ? [
        {
          title: 'No.',
          dataIndex: 'key',
          key: 'key',
          width: 60,   // control the width of the first column
        },
        ...Object.keys(scheduleData[0])
            .filter((key) => key !== 'key')  // show the table without the key
            .map((key) => ({
              title: key,
              dataIndex: key,
              key: key,
              width: 90,  // adjusting table cell width
            }))
      ]
      : [];


  const handleCompetitionChange = (value: string) => {
    setSelectedSeason(value);
    fetchScheduleData(value);
  };


  // route to the scheudling page
  const handleGenerateClick = async () => {
    // Find the selected competition in the competitionData array
    const selectedCompetition = competitionData.find((item) => item["scheduleUnitId"] === selectedSeason);

    // Get the JWT token from cookies
    const token = Cookies.get('currentUser');
    if (selectedCompetition) {
      try {
        setLoading(true);
        message.info(`Generation process started. Selected Competition ID: ${selectedCompetition["scheduleUnitId"]}`);

        const formdata = new FormData();
        formdata.append("fileId", selectedCompetition["scheduleUnitId"]);

        const response = await axios.post(
            `${apiConfig.backendUrl}/schedule-unit/schedule`,
            formdata,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
              },
            }
        );

        if (response.status === 200) {
          // response.data.code
          if (response.data.code === 1) {
            localStorage.setItem("compName", selectedCompetition["fileName"]);
            localStorage.setItem("compId", selectedCompetition["scheduleUnitId"]);
            router.push("/pages/schedule");
            // message.success("Fixtures scheduled successfully");
            message.success(`Schedule success: ${response.data.msg}`);
          } else {
            message.error(`Schedule failed: ${response.data.msg}`);
          }
        } else {
          message.error(response.data.msg || 'Schedule failed!');
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          message.error(error.response?.data?.message || 'Schedule failed!');
        } else {
          message.error('Internal Server Error during scheduling!');
        }
      } finally {
        setLoading(false);
      }
    } else {
      message.warning('Please select a competition before scheduling.');
    }
  };


  const showDeleteConfirm = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this competition?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        if (!selectedSeason) return;

        const token = Cookies.get('currentUser');

        try {
          const response = await axios.delete(`${apiConfig.backendUrl}/schedule-unit/delete`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            params: {
              fileId: selectedSeason,
            },
          });

          if (response.status === 200 && response.data.code === 1) {
            message.success(`Deleted: ${response.data.msg}`);
            setSelectedSeason("");
            // setTableData([]);
            fetchCompetitions();
            setScheduleData([]);

            // ✅ Refresh the page or re-fetch server props
            // window.location.reload(); 
          } else {  
            message.error(response.data.msg || 'Delete failed');
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Internal Server Error during delete');
        }
      }
    });
  };

  const fetchScheduleData = async (seasonId?: string) => {
    const seasonToFetch = seasonId || selectedSeason;
    if (!seasonToFetch) {
      message.warning('Please select a competition first.');
      return;
    }

    const token = Cookies.get('currentUser');

    try {
      setLoading(true);

      const response = await axios.get(
          `${apiConfig.backendUrl}/schedule-unit/data`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            params: {
              fileId: seasonToFetch,
            },
          }
      );

      if (response.status === 200 && response.data.code === 1) {
        const rawData = response.data.data;
        // sorting: based on sectionCode to order it in ascending order
        const sortedData = rawData.sort((a: any, b: any) => {
          const aVal = a.sectionCode ?? 0;
          const bVal = b.sectionCode ?? 0;
          return aVal - bVal;
        });
        const dataWithKeys = sortedData.map((item: any, index: number) => ({
          ...item,
          key: index + 1
        }));

        console.log(dataWithKeys)

        setScheduleData(dataWithKeys);
        message.success('Schedule data loaded.');
      } else {
        message.error(response.data.msg || 'Failed to fetch schedule data');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || 'Failed to fetch schedule data');
      } else {
        message.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };





  // restrict the upload file type to be either CSV or Excel
  const beforeUpload = (file: File) => {
    const isCsvOrExcel = file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'text/csv';
    if (!isCsvOrExcel) {
      message.error('You can only upload CSV or Excel file!');
    }
    return isCsvOrExcel; // restrict the upload file type
  };


  const handleUpload = async ({ file }: any) => {
    const formData = new FormData();
    formData.append('file', file);
    console.log(file.name);
    const token = Cookies.get('currentUser'); // acquiring JWT Token

    try {
      setUploading(true); // uploading
      const response = await axios.post(
          `${apiConfig.backendUrl}/schedule-unit/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
            },
          }
      );

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const parsedTeams = jsonData.map((item: any, index: number) => ({
            key: index + 1,
            competition: item["comp_name"] || "Open Singles/Doubles",
            section_code: item["section_code"] || 1,
            section_name: item["section_name"] || "OSD-A 1",
            draw_code: item["draw_code"] || 8,
            team_code: item["team_code"] || index + 100,
            team_name: item["team_name"] || `Team ${index + 1}`,
            team_color: item["team_colour"] || "N/A",
            outside_court: item["outside_court"] || 0,
          }));

          const newSeasonId = `uploaded_${Date.now()}`;
          const newSeason = {
            id: newSeasonId,
            name: `Uploaded Sheet (${newSeasonId})`,
            teams: parsedTeams,
          };

          setSeasons((prev) => [...prev, newSeason]);
          setSelectedSeason(newSeasonId);
          // setTableData(parsedTeams);
        } catch (err) {
          message.error("Error parsing Excel file");
        }
      };
      reader.readAsArrayBuffer(file); // read the buffer

      if (response.status === 200) {
        if (response.data.code === 1) {
          // message.success('File uploaded successfully');
          message.success(response.data.msg);
          fetchCompetitions(true); // refresh the competition list atfer successful upload
        } else {
          message.error(`Upload failed: ${response.data.msg}`);
        }
      } else {
        message.error(`Upload failed: ${response.statusText}`);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || 'Upload failed');
      } else {
        message.error('Internal Server Error during file upload');
      }
    } finally {
      setUploading(false); // upload completed
    }
  };

  // Fetch competition list from the backend
  const fetchCompetitions = async (autoSelectLatest = false) => {
    try {
      const token = Cookies.get('currentUser');

      if (!token) {
        message.error('User not logged in');
        return;
      }

      const response = await axios.get(`${apiConfig.backendUrl}/schedule-unit/getAllFiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        if (response.data.code === 1) {
          console.log('Competition data:', response.data.data);
          message.success(response.data.msg);
          setCompetitionData(response.data.data); // hool to defined component


          if (autoSelectLatest && response.data.data.length) {
           // assume the Backend has createdAt / uploadTime and it is sorted
            const latest = [...response.data.data].sort(
                (a, b) =>
                    new Date(b.uploadTime || b.createdAt || 0).getTime() -
                    new Date(a.uploadTime || a.createdAt || 0).getTime()
            )[0];

            const latestId = latest?.scheduleUnitId;
            if (latestId) {
              setSelectedSeason(latestId);
              fetchScheduleData(latestId);        // fetch the data
            }
          }
        } else {
          message.error(`Failed to fetch competitions: ${response.data.msg}`);
        }
      } else {
        message.error(`Failed to fetch competitions: ${response.statusText}`);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || 'Failed to fetch competitions');
      } else {
        message.error('An unknown error occurred');
      }
    }
  };


  return (
      <div className="h-screen flex">
        {/* include Sidebar */}
        <Sidebar />

        {/* main section */}
        <div className="flex-1 flex flex-col">
          <Header username={username} email={email} pageName="Competitions Management" />


          <main className="flex-1 flex flex-col items-center justify-center bg-gray-100 min-h-screen">
            {/* Loading spinner */}
            {/* <Spin spinning={loading} tip="Scheduling..."></Spin> */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                  <Spin size="large" tip="Scheduling..." />
                </div>
            )}
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-7xl mt-12">
              <h2 className="text-2xl font-bold text-center text-[#3b4f84] mb-6">Competitions Management</h2>

              {/* competition selection */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <label className="text-lg font-bold mr-4 text-black">Select Competition</label>
                  <Select
                      value={selectedSeason}
                      onChange={handleCompetitionChange}
                      className="w-64"
                  >
                    {/* {seasons.map((season) => (
                    <Option key={season.id} value={season.id}>
                      {season.name}
                    </Option>
                  ))} */}
                    {competitionData.map((item) => (
                        <Option key={item['scheduleUnitId']} value={item['scheduleUnitId']}>
                          {item['fileName'] + " " + item['scheduleUnitId']}
                        </Option>
                    ))}
                  </Select>
                </div>

                <div className="flex-grow flex justify-center">
                  {/* <Button
                  type="default"
                  className="w-1/2 bg-gray-200 text-black font-bold py-2 rounded-md"
                  onClick={() => router.push("/pages/constrains")}>
                  Constraints Management
                </Button> */}
                  <Button
                      type="default"
                      className="min-w-[160px] bg-gray-200 text-black font-bold py-2 px-4 rounded-md text-sm text-center whitespace-normal break-words"
                      onClick={() => {
                        if (!selectedSeason) {
                          message.warning("Please select a competition first.");
                        } else {
                          // router.push("/pages/constrains");
                          router.push(`/pages/constrains?scheduleUnitId=${selectedSeason}`);
                        }
                      }}>
                    Constraints Management
                  </Button>
                </div>

                {/* upload button, restrict upload file type */}
                {selectedSeason ? (
                    <Button
                        danger
                        type="primary"
                        onClick={showDeleteConfirm}
                        loading={uploading}
                    >
                      Delete Competition
                    </Button>
                ) : (
                    <Upload
                        beforeUpload={beforeUpload}
                        customRequest={handleUpload}
                        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        listType="text"
                        maxCount={1}
                        showUploadList={uploading}
                    >
                      <Button icon={<UploadOutlined />}>Upload CSV/Excel</Button>
                    </Upload>
                )}

              </div>

              {/* table form Container */}
              {
                <div style={{ height: '500px', overflow: 'auto' }}>
                  <Table
                      columns={columns}
                      dataSource={scheduleData}
                      pagination={false}
                      sticky // fix the table title row
                  />
                </div>}

              {/* scheudling buttong*/}
              <div className="flex justify-end mt-4">
                <Button className="w-48" type="primary" onClick={handleGenerateClick}>
                  Schedule
                </Button>
              </div>
            </div>

            {/* Footer */}
            <Footer />
          </main>
        </div>
      </div>
  );
};

export default withAuth(Competitions);
