import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { OverlayPanel } from "primereact/overlaypanel";          
import { Button } from "primereact/button";
import { InputNumber } from 'primereact/inputnumber';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

const DataTableComponent: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>({});
  const [first, setFirst] = useState(0);
  const [rows] = useState(12);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectNumber, setSelectNumber] = useState(0);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`);
      const { data, pagination } = response.data;
      setArtworks(data);
      setTotalRecords(pagination.total);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: any) => {
    setFirst(event.first);
    const currentPage = event.page + 1;
    fetchArtworks(currentPage);
  };

  useEffect(() => {
    fetchArtworks(1);
  }, []);

  const onRowSelect = (e: any) => {
    const selectedRowId = e.data.id;
    setSelectedRows((prev) => ({ ...prev, [selectedRowId]: true }));
    setSelectedArtworks([...selectedArtworks, e.data]);
  };

  const onRowUnselect = (e: any) => {
    const deselectedRowId = e.data.id;
    setSelectedRows((prev) => ({ ...prev, [deselectedRowId]: false }));
    setSelectedArtworks(selectedArtworks.filter((artwork) => artwork.id !== deselectedRowId));
  };

  const onSelectAllChange = (e: any) => {
    let _selectedArtworks: Artwork[] = [];

    if (e.checked) {
      _selectedArtworks = [...artworks];
      const newSelectedRows = artworks.reduce((acc, row) => {
        acc[row.id] = true;
        return acc;
      }, {} as { [key: number]: boolean });

      setSelectedRows((prev) => ({ ...prev, ...newSelectedRows }));
    } else {
      const deselectedRowIds = artworks.map((row) => row.id);
      const newSelectedRows = { ...selectedRows };
      deselectedRowIds.forEach((id) => delete newSelectedRows[id]);
      setSelectedRows(newSelectedRows);
    }

    setSelectedArtworks(_selectedArtworks);
    setSelectAllChecked(e.checked);
  };

  const op = useRef<OverlayPanel>(null);

  const selectSpecificRows = (e: any) => {
    e.preventDefault();

    let _selectedArtworks: Artwork[] = [];

    if (selectNumber > 0 && selectNumber <= artworks.length) {
      _selectedArtworks = artworks.slice(0, selectNumber);

      const newSelectedRows = _selectedArtworks.reduce((acc, row) => {
        acc[row.id] = true;
        return acc;
      }, {} as { [key: number]: boolean });

      setSelectedRows((prev) => ({ ...prev, ...newSelectedRows }));
    }

    setSelectedArtworks(_selectedArtworks);
    op.current?.hide();
  };

  return (
    <div>
      <DataTable
        value={artworks}
        paginator
        rows={rows}
        totalRecords={totalRecords}
        lazy
        first={first}
        loading={loading}
        onPage={onPageChange}
        selectionMode="checkbox"
        selection={selectedArtworks}
        onRowSelect={onRowSelect}
        onRowUnselect={onRowUnselect}
        dataKey="id"
        selectAll={selectAllChecked}
        onSelectAllChange={onSelectAllChange}
      >
        <Column selectionMode="multiple" style={{ width: "3em" }} headerStyle={{ width: '3em' }} alignHeader="left" />
        <Column
          header={() => (
            <div className="custom-header">
              <div className="checkbox-header">
                <Button
                  className="black-b"
                  type="button"
                  icon="pi pi-check"
                  onClick={(e) => op.current?.toggle(e)}
                  aria-label="Select All"
                />
              </div>
              <OverlayPanel ref={op}>
                <div>
                  <InputNumber
                    value={selectNumber}
                    onValueChange={(e) => setSelectNumber(e.value ?? 0)}
                    min={0}
                    max={artworks.length}
                  />
                  <Button
                    className="black-b"
                    type="submit"
                    label="Select"
                    onClick={selectSpecificRows}
                  />
                </div>
              </OverlayPanel>
            </div>
          )}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
    </div>
  );
};

export default DataTableComponent;
