"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
const axios = require('axios').default;

const API_URL = "http://127.0.0.1:5000";  // API URL

export default function FormPage() {
  const [formData, setFormData] = useState({
    name: "Tammireddy Srinivas",
    email: "tsrin2003@gmail.com",
    income: "100",
  });
  const [entries, setEntries] = useState([]);

  // Fetch entries from the API
  const fetchEntries = () => {
    axios.get(`${API_URL}/bonus`)  // API endpoint
      .then((response) => {
        console.log("Response:", response.data);
        setEntries(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch bonuses:", error);
      });
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = {
      name: formData.name,
      email: formData.email,
      income: Number.parseFloat(formData.income),
    };

    try {
      axios.post(
        `${API_URL}/bonus`,  // API endpoint
        newEntry
      ).then((response) => {
        console.log("Response:", response.data);
        fetchEntries();  // Refresh entries after submitting a new entry
      }).catch((error) => {
        console.error("Failed to submit bonus:", error);
      });
      // setFormData({ name: "", email: "", income: "" }) // Reset form
    } catch (error) {
      console.error("Failed to submit bonus:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClearAll = () => {
    axios.delete(`${API_URL}/bonus`)  // API endpoint to truncate table
      .then(() => {
        setEntries([]);  // Clear the entries state
      })
      .catch((error) => {
        console.error("Failed to clear bonuses:", error);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Income Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap md:flex-nowrap gap-4">
          <div className="w-full md:w-1/3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required />
          </div>
          <div className="w-full md:w-1/3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required />
          </div>
          <div className="w-full md:w-1/3">
            <Label htmlFor="income">Income per annum</Label>
            <Input
              id="income"
              name="income"
              type="number"
              value={formData.income}
              onChange={handleChange}
              placeholder="Enter your annual income"
              required />
          </div>
        </div>
        <Button type="submit">Submit Entry</Button>
      </form>
      <div className="mt-8">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold mb-4">Entries</h2>
          <Button onClick={handleClearAll} className="bg-red-500 hover:bg-red-700 text-white">Clear All</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Income per Annum</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Bonus (25%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry[0]}</TableCell>
                  <TableCell>{entry[1]}</TableCell>
                  <TableCell>{entry[2]}</TableCell>
                  <TableCell>${entry[3]}</TableCell>
                  <TableCell>{entry[4]}</TableCell>
                  <TableCell>${(entry[3]* 0.25).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

