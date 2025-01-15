'use client';

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Progress } from "@nextui-org/progress";
import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/chip";
import { subtitle, title } from "@/components/primitives";
import { useState, useRef } from "react";
import { InfoIcon } from "lucide-react";

interface PredictionResponse {
  class: string;
  confidence: number;
}

export default function FlowerClassifier() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setPrediction(null);

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  return (
    <main className="container mx-auto px-4 max-w-4xl">
      <Card className="mb-8">
        <CardHeader className="flex-col items-start px-6 py-4">
          <div className="inline-block max-w-xl text-center justify-center">
            <span className={title()}>Flower&nbsp;</span>
            <span className={title({ color: "violet" })}>Classifier&nbsp;</span>
            <div className={subtitle({ class: "mt-4" })}>
              Upload an image to identify the type of flower.
            </div>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex justify-center items-center gap-2 bg-default-100 p-4 rounded-lg">
            <InfoIcon className="w-5 h-5 text-default-600" />
            <p className="text-sm text-default-600">
              Model can classify: daisy, dandelion, rose, sunflower, and tulip.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="imageUpload"
            />
            <Button
              onClick={triggerFileInput}
              color="primary"
              className="w-full md:w-auto cursor-pointer"
            >
              Select Image
            </Button>
          </div>

          {preview && (
            <div className="mt-4">
              <Image
                src={preview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {error && (
            <p className="text-danger mt-2">{error}</p>
          )}

          <Button
            color="success"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!selectedFile || loading}
            className="w-full md:w-auto"
          >
            {loading ? 'Processing...' : 'Classify Flower'}
          </Button>

          {loading && (
            <Progress
              size="sm"
              isIndeterminate
              aria-label="Loading..."
              className="max-w-md"
            />
          )}

          {prediction && (
            <Card className="mt-4 bg-default-50">
              <CardBody>
                <h3 className="text-xl font-semibold mb-4">Classification Results</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Flower Type:</span>
                    <Chip
                      color={getConfidenceColor(prediction.confidence)}
                      variant="flat"
                      size="lg"
                    >
                      {prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1)}
                    </Chip>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Confidence:</span>
                      <Chip
                        color={getConfidenceColor(prediction.confidence)}
                        variant="flat"
                      >
                        {(prediction.confidence * 100).toFixed(1)}%
                      </Chip>
                    </div>
                    <Progress
                      value={prediction.confidence * 100}
                      color={getConfidenceColor(prediction.confidence)}
                      className="max-w-md"
                      aria-label="Classification Confidence"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>
    </main>
  );
}