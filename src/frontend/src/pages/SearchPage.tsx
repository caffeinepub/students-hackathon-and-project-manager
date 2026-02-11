import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Loader2 } from 'lucide-react';
import { useSearchAchievements, useGetAchievementsByStudentId, useGetAllProfiles } from '../hooks/useQueries';
import SearchResultsList from '../components/SearchResultsList';
import AchievementDetailPanel from '../components/AchievementDetailPanel';
import { Achievement } from '../backend';

export default function SearchPage() {
  const [searchMode, setSearchMode] = useState<'studentId' | 'text'>('studentId');
  const [studentIdQuery, setStudentIdQuery] = useState('');
  const [textQuery, setTextQuery] = useState('');
  const [activeStudentId, setActiveStudentId] = useState('');
  const [activeTextQuery, setActiveTextQuery] = useState('');

  const { data: studentAchievements = [], isLoading: studentLoading } = useGetAchievementsByStudentId(activeStudentId);
  const { data: textAchievements = [], isLoading: textLoading } = useSearchAchievements(activeTextQuery);
  const { data: profiles = [] } = useGetAllProfiles();

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const studentNames = new Map(profiles.map((p) => [p.studentId || '', p.name]));

  const handleStudentIdSearch = () => {
    setActiveStudentId(studentIdQuery.trim());
  };

  const handleTextSearch = () => {
    setActiveTextQuery(textQuery.trim());
  };

  const isLoading = searchMode === 'studentId' ? studentLoading : textLoading;
  const results = searchMode === 'studentId' ? studentAchievements : textAchievements;
  const hasSearched = searchMode === 'studentId' ? activeStudentId !== '' : activeTextQuery !== '';

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Search Achievements</h1>
        <p className="text-muted-foreground mt-1">Find verified student achievements</p>
      </div>

      <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'studentId' | 'text')} className="space-y-6">
        <TabsList>
          <TabsTrigger value="studentId">Search by Student ID</TabsTrigger>
          <TabsTrigger value="text">Search by Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="studentId" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Student ID (e.g., STU12345)"
                  value={studentIdQuery}
                  onChange={(e) => setStudentIdQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStudentIdSearch();
                  }}
                />
                <Button onClick={handleStudentIdSearch} disabled={!studentIdQuery.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasSearched ? (
            <SearchResultsList
              achievements={results}
              onViewDetails={(achievement) => {
                setSelectedAchievement(achievement);
                setShowDetail(true);
              }}
              studentNames={studentNames}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Enter a Student ID to search</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by title, description, or keywords..."
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTextSearch();
                  }}
                />
                <Button onClick={handleTextSearch} disabled={!textQuery.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasSearched ? (
            <SearchResultsList
              achievements={results}
              onViewDetails={(achievement) => {
                setSelectedAchievement(achievement);
                setShowDetail(true);
              }}
              studentNames={studentNames}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Enter keywords to search</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAchievement && (
            <AchievementDetailPanel
              achievement={selectedAchievement}
              studentName={studentNames.get(selectedAchievement.studentId)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

