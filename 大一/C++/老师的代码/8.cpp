//重载下标运算符

#include <iostream>
#include <string.h>
using namespace std;

//目前数组只能是整数，使用【类模板】后
//它可以装【任何】数据类型 

class MyArray{
private:
	//禁用赋值运算 
	MyArray operator=(const MyArray&) {
		throw"谁让你用的，哼！";
		return MyArray(1);
	}
	int *a;	//别嫌弃，它可以是任意数据类型
	int nSize;//数组长度 
public: 
    MyArray(int nSize=100):nSize(nSize) {
		a=new int[nSize];
		memset(a,0,nSize*sizeof(int));
	}
	
	MyArray(const MyArray &src){
		//深拷贝 
		nSize=src.nSize;
		a=new int[nSize];
		memcpy(a,src.a,nSize*sizeof(int));
	}
	
	~MyArray() {
		delete[]a;
	}
	
	int &operator[](int i) {
		if(i>=nSize) {
			throw"MyArray:下标越界";
		}
		
		return *(a+i);
	}
	
	void display() const{
		for(int i=0;i<nSize;i++) {
			cout<<"\t"<<a[i];
			if((i+1)%8==0) {
				cout<<endl;
			}
		}
	}
	
	int size() {
		return nSize;
	}
	
	void resize(int nSize2) {
		if (nSize==nSize2) {
			return;
		}
		int *a2=new int[nSize2];
		if(nSize<nSize2) {
			memset(a2,0,nSize2*sizeof(int));
			memcpy(a2,a,nSize*sizeof(int));
			delete[]a;
			a=a2;
		} else{
			memcpy(a2,a,nSize2*sizeof(int));
		}
	}
};

int main () {
	try{
	    MyArray a(30);
	
	    a.display();
	    cout<<endl;
	
	    for (int i=0;i<a.size()+100;i++) {
		    a[i]=i*2;
	    }
	
	    a.display();
	    cout<<endl;
	}catch(const char*sError) {
		cout<<sError<<endl;
	}
	return 0;
} 
