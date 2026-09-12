#include <iostream>
#include <vector>
#include <Windows.h>
#include <algorithm>
#include <functional>//STL中函数 

using namespace std;

//a是向量容器的引用 
void mySort1(vector<double>&a){
	int time1=GetTickCount();
	double t;
	//vector是顺序容器，故a[i]效率极高，所以不需要使用迭代器 
	for (int i=0;i+1<a.size();i++) {
		for (int j=i+1;j<a.size();j++) {
			if (a[i]>a[j]) {
				t=a[i];
				a[i]=a[j];
				a[j]=t;
			}
		}
	}
	
	int time2=GetTickCount();
	cout<<"选择排序用时:"<<time2-time1<<"ms"<<endl;
}

//比较函数 
bool comDouble(const double &a1,const double &a2){
	return a1<a2;
}
//算法库排序 
void mySort2(vector<double> &a) {
    int time1=GetTickCount();
    
	//算法库排序：第一个元素地址，最后一个元素地址，比较函数 
	//sort (a.begin(),a.end(),less<double>());
	sort (a.begin(),a.end(),comDouble); 
	
	int time2=GetTickCount();	
	cout<<"算法库排序用时:"<<time2-time1<<"ms"<<endl;
}

void showData(const vector<double> &a) {
	cout<<endl;
	for(int i=0;i<a.size();i++) {
		cout<<a[i]<<endl;
		if(i>100) {
			break;
		}
	}
}

int main () {
	vector<double> a1;
	vector<double> a2;
	int N=1000000;
	double t;
	//添加一个随机种子 
	srand(GetTickCount());
	for(int i=0;i<N;i++) {
		t=(rand()/100.0);
		a1.push_back(t);//把t放在容器末尾 
		a2.push_back(t);
	}
	
	//选择排序 
	//mySort1(a1);
	
	//算法库排序 
	mySort2(a2);
	
	showData(a2);
	return 0;
}
