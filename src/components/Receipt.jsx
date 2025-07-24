import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { toPng, toJpeg } from "html-to-image";
import { saveAs } from "file-saver";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { Button } from "@mui/material";
import { FileText, Image, ImageDown, PanelsRightBottom } from "lucide-react";

function Receipt() {
  const param = useParams();
  const [feeData, setFeeData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`/fee/${param.id}`);
      setFeeData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log(feeData);
  // Add this function at the top of your file
  function numberToWords(num) {
    const a = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];
    const b = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];

    if ((num = num.toString()).length > 9) return "OVERFLOW";
    let n = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";
    let str = "";
    str +=
      n[1] != 0
        ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " CRORE "
        : "";
    str +=
      n[2] != 0
        ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " LAKH "
        : "";
    str +=
      n[3] != 0
        ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " THOUSAND "
        : "";
    str +=
      n[4] != 0
        ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " HUNDRED "
        : "";
    str +=
      n[5] != 0
        ? (str != "" ? "AND " : "") +
          (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
        : "";
    return str.trim() + " RUPEES";
  }
  const downloadReceipt = async (format) => {
    const receiptElement = document.getElementById("receipt");
    const options = {
      quality: 1,
      pixelRatio: 3,
      backgroundColor: "white",
    };

    try {
      if (format === "pdf") {
        // For PDF, first convert to PNG then create PDF
        const dataUrl = await toPng(receiptElement, options);
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${feeData?.receiptNo}.pdf`);
      } else {
        // For PNG/JPG use html-to-image directly
        const dataUrl =
          format === "jpg"
            ? await toJpeg(receiptElement, options)
            : await toPng(receiptElement, options);
        saveAs(dataUrl, `receipt-${feeData?.receiptNo}.${format}`);
      }
    } catch (err) {
      console.error(`Error generating ${format} receipt:`, err);
    }
  };

  if (!feeData) {
    return <div className="text-sm p-4">Loading receipt data...</div>;
  }

  return (
    <div className="p-2 max-w-3xl mx-auto text-xs">
      <div className="flex justify-between items-center my-5">
        <h1 className="text-xl font-bold">Payment Receipt</h1>
        <div className="flex gap-5">
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<ImageDown size={16} />}
            onClick={() => downloadReceipt("png")}
            className="mr-2"
          >
            Download PNG
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="success"
            startIcon={<Image size={16} />}
            onClick={() => downloadReceipt("jpg")}
            className="mr-2"
          >
            Download JPG
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<FileText size={16} />}
            onClick={() => downloadReceipt("pdf")}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <div
        id="receipt"
        className="bg-white p-3 border border-gray-200"
        style={{ width: "210mm" }}
      >
        {/* Header Section */}
        <div className="text-center mb-1 relative ">
          <div className=" absolute text-left top-0 left-0">
            <p>
              <span className="font-bold text-sm">Fee Payment Reciept </span>
            </p>
            <p>
              <span className="font-bold">Date : </span>
              {feeData.paymentDate.split("T")[0]}
            </p>
            <p>
              <span className="font-bold">Reciept No. : </span>
              {feeData.receiptNo}
            </p>
          </div>
          <div className=" absolute top-2 right-2">
            <QRCodeSVG
              value={`${import.meta.env.VITE_UI_URI}/receipt/${param.id}`}
              size={80}
              level="H"
            />
          </div>
          <div className="flex justify-center">
            <img src="/img/DigiCoders-Logo-Black.png" width={250} alt="" />
          </div>
          <p className="text-xs">
            B-36, Sector 0, Near Ram Ram Bank Chauraha, Aliganj, Lucknow Uttar
            Pradesh 226021
          </p>
          <p className="text-xs">info@digicoders.in, www.thedigicoders.com</p>
          <p className="text-xs">
            +91 9140-96-7607, +91 6394-29-6293, 0522-2435604
          </p>
        </div>

        <div className="border-t border-slate-500 pb-1 my-2"></div>

        {/* Student Information Section */}
        <div className="mb-4">
          <div className="mb-3 flex">
            <span className="font-semibold w-30">Name:</span>
            <span className="border-b border-black flex-1">
              {feeData.registrationId.studentName}
            </span>
          </div>
          <div className="mb-3 flex">
            <span className="font-semibold w-30">College:</span>
            <span className="border-b border-black flex-1">
              {feeData.registrationId.collegeName}
            </span>
          </div>
          <div className="mb-3 flex gap-4">
            <div className="flex items-center w-[70%]">
              <span className="font-semibold w-30 shrink-0">Course:</span>
              <span className="flex-1 block min-w-0 border-b border-black pl-2 pb-0.5">
                {feeData.registrationId.education.name} (
                {feeData.registrationId.technology.name})
              </span>
            </div>
            <div className="flex items-center w-[30%]">
              <span className="font-semibold w-10 shrink-0">Year:</span>
              <span className="flex-1 block min-w-0 border-b border-black pl-2 pb-0.5">
                {feeData.registrationId.eduYear}
              </span>
            </div>
          </div>
          <div className="mb-3 flex">
            <span className="font-semibold w-30">Account Of:</span>
            <span className="border-b border-black flex-1">
              {feeData.registrationId.training.name}
            </span>
          </div>
        </div>

        {/* Payment Mode Section */}
        <div className="mb-3 flex items-center">
          <h3 className="font-semibold mb-1">Payment Mode:</h3>
          <div className="flex space-x-10 ml-7">
            {["cash", "online", "cheque"].map((mode) => (
              <div key={mode} className="flex items-center">
                <input
                  type="checkbox"
                  checked={feeData.mode === mode}
                  readOnly
                  className="mr-1"
                />
                <span>{mode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Section */}
        <div className=" ">
          <div className="mb-3 flex">
            <span className="font-semibold w-30">Amount In Words:</span>
            <span className="border-b border-black flex-1">
              {feeData.amount
                ? numberToWords(Number(feeData.amount))
                : "ONE THOUSAND FIVE HUNDRED RUPEES"}
            </span>
          </div>
          <div className="mb-3 flex space-x-12 items-center">
            <span className="font-semibold">Includes:</span>
            <div className="flex space-x-10 mt-1 ml-4">
              {["Training Fee", "Registration Fee"].map((item) => (
                <div key={item} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      (item === "Training Fee" &&
                        feeData.paymentType === "installment") ||
                      (item === "Registration Fee" &&
                        feeData.paymentType === "registration")
                    }
                    readOnly
                    className="mr-1"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code and Note Section */}
        <div className=" mt-8 relative ">
          <div className=" absolute -top-10 left-[55%]">
            <img src="/img/paid.png" width={100} alt="" />
          </div>
          <div className=" absolute -top-8 right-4  ">
            <div className="flex items-center justify-center mb-2">
              <img src="/img/sign.png" width={100} alt="" />
            </div>
            <hr />
            <div className="text-sm">Authorized Sign & Stamp</div>
          </div>
          <div className="text-sm font-bold flex gap-5 items-center">
            <div className="flex items-center  ">
              <span className="border border-slate-500 bg-sky-50 px-3 border-r py-2">
                ₹
              </span>
              <div className="border border-slate-500 bg-sky-50 w-40 p-2">
                {" "}
                2000
              </div>
            </div>
            <div>
              <p>
                <span>Payment Status : </span>{" "}
                <span
                  className={`${
                    feeData.paymentStatus === "success"
                      ? "text-green-600"
                      : feeData.paymentStatus === "failed"
                      ? "text-red-600"
                      : "text-orange-400"
                  }`}
                >
                  {feeData.paymentStatus}
                </span>
              </p>
            </div>
          </div>
          <div className=" text-xs italic mt-4">
            <p>
              {" "}
              <span className="font-bold">Note:</span> Submitted Fee is Not
              Refundable nor transferable
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-4  text-center text-xs">
          <p>
            <span className="font-bold">CIN:</span> U72900UP2019PTC113696{" "}
            <span className="font-bold"> GSTIN:</span> 09AAHCD1032D1Z6
          </p>
          <div className="grid grid-cols-6 gap-x-10 items-center mt-2 px-4 ">
            <div>
              <img src="/img/digicoders-iso.jpeg" alt="" />
            </div>
            <div>
              <img src="/img/digicoders-gem.jpeg" alt="" />
            </div>
            <div>
              <img src="/img/digicoders-MCA.jpeg" alt="" />
            </div>
            <div>
              <img src="/img/digicoders-msme.jpeg" alt="" />
            </div>
            <div>
              <img src="/img/Digital-India-digicoders.jpeg" alt="" />
            </div>
            <div>
              <img src="/img/startup-india-digicoders.jpeg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Receipt;
