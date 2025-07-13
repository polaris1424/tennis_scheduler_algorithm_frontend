"use client";

import { useEffect, useState } from 'react';
import { Select, Button, Upload, message, Table, Spin } from 'antd';
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
import { useSearchParams } from 'next/navigation';


// const { Option } = Select;

const Constraints = () => {

    const [username, setUsername] = useState("Guest");
    const [email, setEmail] = useState("xxx@mail.com");


      const searchParams = useSearchParams();
      const scheduleUnitId = searchParams.get("scheduleUnitId");
      console.log(scheduleUnitId)
      if (!scheduleUnitId) {
        message.error("Missing competition ID (scheduleUnitId)");
        return;
      }


  const [uploading, setUploading] = useState(false); // control upload progress

  const [competitionData, setCompetitionData] = useState([])
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter(); // Initialize useRouter hook

  const [constraintData, setConstraintData] = useState<any[]>([]); // store form data

  useEffect(() => {
    if (typeof window !== 'undefined') { // make sure it is in a proper browser window
      const storedUsername = localStorage.getItem("username") || "Guest";
      const storedEmail = localStorage.getItem("email") || "xxx@mail.com";
      setUsername(storedUsername);
      setEmail(storedEmail);
    }
    // fetch constraint data when loading this page
    if (scheduleUnitId) {
        fetchConstraintData(scheduleUnitId);
    } else {
        message.error("Missing competition ID (scheduleUnitId)");
    }
  }, [scheduleUnitId]);

  const fetchConstraintData = async (fileId?: string) => {
    const token = Cookies.get('currentUser');

    try {
        setLoading(true);

        const response = await axios.get(
            `${apiConfig.backendUrl}/schedule-constraint/constraintData`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    fileId: fileId,
                },
            }
        );

        if (response.status === 200 && response.data.code === 1) {
            const rawData = response.data.data;
            const dataWithKeys = rawData.map((item: any, index: number) => ({
                ...item,
                teamCodes: item.teamCodes ? item.teamCodes.join(", ") : "", // parse int list into String
                key: index + 1
            }));

            setConstraintData(dataWithKeys);
            message.success('Constraint data loaded.');
        } else {
            message.error(response.data.msg || 'Failed to fetch constraint data');
        }
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Failed to fetch constraint data');
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
    formData.append('fileId', scheduleUnitId); // passing the file ID
  
    const token = Cookies.get('currentUser');
  
    try {
      setUploading(true); // control the loading status
  
      const response = await axios.post(
        `${apiConfig.backendUrl}/schedule-constraint/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        if (response.data.code === 1) {
          message.success(response.data.msg);
          fetchConstraintData(scheduleUnitId!); // refresh the data after upload
        } else {
          message.error(`Upload failed: ${response.data.msg}`);
        }
        // fetchCompetitions();
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
      setUploading(false);
    }
  };

  // // Fetch competition list from the backend
  const columns = constraintData.length > 0
    ? [
        {
            title: 'No.',
            dataIndex: 'key',
            key: 'key',
            width: 60,
        },
        ...Object.keys(constraintData[0])
            .filter((key) => key !== 'key')
            .map((key) => ({
                title: key,
                dataIndex: key,
                key: key,
                width: 150,
            }))
    ]
    : [];


  return (
    <div className="h-screen flex">
      {/* include Sidebar */}
      <Sidebar />

      {/* main section */}
      <div className="flex-1 flex flex-col">
        <Header username={username} email={email} pageName="Constraints" />


        <main className="flex-1 flex flex-col items-center justify-center bg-gray-100 min-h-screen">
          {/* Loading spinner */}
          {/* <Spin spinning={loading} tip="Scheduling..."></Spin> */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
              <Spin size="large" tip="Scheduling..." />
            </div>
          )}
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-7xl mt-12">
            <h2 className="text-2xl font-bold text-center text-[#3b4f84] mb-6">Special Requests Management</h2>

            {/* competition selection */}
            <div className="flex items-center justify-between mb-6">

              <div className="flex justify-between w-full mb-4">
                <Button 
                  type="default" 
                  className="bg-gray-200 text-black font-bold py-2 rounded-md"
                  onClick={() => router.push("/pages/competitions")}>
                  Back
                </Button>
              </div>

              {/* upload button, restrict upload file type */}
              <Upload 
                beforeUpload={beforeUpload} 
                customRequest={handleUpload}
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                listType="text" 
                maxCount={1} // only 1 file for upload
                showUploadList={uploading}  // hide the uploading progress after uploading
              >
                <Button icon={<UploadOutlined />}>Upload Constraints</Button>
              </Upload>
            </div>

            {/* table form Container */}
            <div style={{ height: '500px', overflow: 'auto' }}>
              <Table 
                columns={columns} 
                dataSource={constraintData} 
                pagination={false} 
                sticky // fix the table title row
              />
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

// export default Constraints;
export default withAuth(Constraints);
