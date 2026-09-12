//STL（标准模板库）

#include <iostream>
#include <Windows.h>
#include <vector>//向量容器 
#include <algorithm>//算法库 
#include <iostream>
using namespace std;

void mySort(vector<double> &a){
	int t1=GetTickCount();
	for (int i=0;i+1<a.size();i++) {
		for (int j=i+1;j<a.size();j++) {
			if (a[i]>a[j]) {
				double t=a[i];
				a[i]=a[j];
				a[j]=t;
			}
		}
	}
	cout<<"自己排序用时："<<GetTickCount()-t1<<" ms"<<endl;
}
int main() {
	int N=100;
	srand(GetTickCount());
	vector<double>a1;
	vector<double>a2;
	double t; 
	
	//往向量容器里添加数据 
	for(int i=0;i<N;i++) {
		t=(rand()/100.0)*rand();
		a1.push_back(t);
		a2.push_back(t);
	}
	
	return 0;
} 
